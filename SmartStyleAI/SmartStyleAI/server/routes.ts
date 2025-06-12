import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertWardrobeItemSchema, 
  insertOutfitSchema, 
  insertSocialPostSchema 
} from "@shared/schema";
import { generateOutfitRecommendation, analyzeWardrobeForSustainability } from "./openai";
import multer from "multer";
import { z } from "zod";

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Weather API route
  app.get('/api/weather', async (req, res) => {
    try {
      const { lat, lon } = req.query;
      const apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || 'demo_key';
      
      // Mock weather data if no API key
      if (apiKey === 'demo_key') {
        res.json({
          condition: 'Partly Cloudy',
          temperature: 72,
          location: 'San Francisco',
          description: 'Perfect for light layers'
        });
        return;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
      );
      
      if (!response.ok) {
        throw new Error('Weather API failed');
      }
      
      const data = await response.json();
      res.json({
        condition: data.weather[0].main,
        temperature: Math.round(data.main.temp),
        location: data.name,
        description: data.weather[0].description
      });
    } catch (error) {
      console.error('Weather API error:', error);
      res.json({
        condition: 'Partly Cloudy',
        temperature: 72,
        location: 'Your Location',
        description: 'Weather data unavailable'
      });
    }
  });

  // Wardrobe routes
  app.get('/api/wardrobe', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { category } = req.query;
      
      const items = category 
        ? await storage.getWardrobeItemsByCategory(userId, category as string)
        : await storage.getWardrobeItems(userId);
      
      res.json(items);
    } catch (error) {
      console.error('Error fetching wardrobe items:', error);
      res.status(500).json({ message: 'Failed to fetch wardrobe items' });
    }
  });

  app.post('/api/wardrobe', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Handle image upload with base64 encoding for simplicity
      let imageUrl = null;
      if (req.file) {
        const base64 = req.file.buffer.toString('base64');
        imageUrl = `data:${req.file.mimetype};base64,${base64}`;
      }
      
      const itemData = insertWardrobeItemSchema.parse({
        ...req.body,
        userId,
        imageUrl,
        purchasePrice: req.body.purchasePrice ? req.body.purchasePrice : null,
        isEthical: req.body.isEthical === 'true',
        isSustainable: req.body.isSustainable === 'true',
      });
      
      const item = await storage.createWardrobeItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      console.error('Error creating wardrobe item:', error);
      res.status(400).json({ message: 'Failed to create wardrobe item' });
    }
  });

  app.put('/api/wardrobe/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const item = await storage.updateWardrobeItem(id, updates);
      res.json(item);
    } catch (error) {
      console.error('Error updating wardrobe item:', error);
      res.status(400).json({ message: 'Failed to update wardrobe item' });
    }
  });

  app.delete('/api/wardrobe/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteWardrobeItem(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting wardrobe item:', error);
      res.status(400).json({ message: 'Failed to delete wardrobe item' });
    }
  });

  // Outfit routes
  app.get('/api/outfits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outfits = await storage.getOutfits(userId);
      res.json(outfits);
    } catch (error) {
      console.error('Error fetching outfits:', error);
      res.status(500).json({ message: 'Failed to fetch outfits' });
    }
  });

  app.post('/api/outfits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outfitData = insertOutfitSchema.parse({
        ...req.body,
        userId,
      });
      
      const outfit = await storage.createOutfit(outfitData);
      res.status(201).json(outfit);
    } catch (error) {
      console.error('Error creating outfit:', error);
      res.status(400).json({ message: 'Failed to create outfit' });
    }
  });

  // AI Outfit recommendations
  app.post('/api/ai/outfit-recommendation', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { occasion, weather } = req.body;
      
      const wardrobeItems = await storage.getWardrobeItems(userId);
      
      if (wardrobeItems.length === 0) {
        res.status(400).json({ message: 'Please add some items to your wardrobe first' });
        return;
      }

      const recommendation = await generateOutfitRecommendation(wardrobeItems, occasion, weather);
      res.json(recommendation);
    } catch (error) {
      console.error('Error generating outfit recommendation:', error);
      res.status(500).json({ message: 'Failed to generate outfit recommendation' });
    }
  });

  // Social routes
  app.get('/api/social/posts', async (req, res) => {
    try {
      const posts = await storage.getSocialPosts();
      res.json(posts);
    } catch (error) {
      console.error('Error fetching social posts:', error);
      res.status(500).json({ message: 'Failed to fetch social posts' });
    }
  });

  app.post('/api/social/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertSocialPostSchema.parse({
        ...req.body,
        userId,
      });
      
      const post = await storage.createSocialPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating social post:', error);
      res.status(400).json({ message: 'Failed to create social post' });
    }
  });

  app.post('/api/social/posts/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      
      await storage.likePost(userId, postId);
      res.status(200).json({ message: 'Post liked successfully' });
    } catch (error) {
      console.error('Error liking post:', error);
      res.status(400).json({ message: 'Failed to like post' });
    }
  });

  app.delete('/api/social/posts/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      
      await storage.unlikePost(userId, postId);
      res.status(200).json({ message: 'Post unliked successfully' });
    } catch (error) {
      console.error('Error unliking post:', error);
      res.status(400).json({ message: 'Failed to unlike post' });
    }
  });

  // Sustainability routes
  app.get('/api/sustainability/brands', async (req, res) => {
    try {
      const brands = await storage.getSustainableBrands();
      res.json(brands);
    } catch (error) {
      console.error('Error fetching sustainable brands:', error);
      res.status(500).json({ message: 'Failed to fetch sustainable brands' });
    }
  });

  app.get('/api/sustainability/analysis', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wardrobeItems = await storage.getWardrobeItems(userId);
      
      const analysis = await analyzeWardrobeForSustainability(wardrobeItems);
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing wardrobe sustainability:', error);
      res.status(500).json({ message: 'Failed to analyze wardrobe sustainability' });
    }
  });

  // Analytics routes
  app.get('/api/analytics/wardrobe-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getWardrobeStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching wardrobe stats:', error);
      res.status(500).json({ message: 'Failed to fetch wardrobe stats' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
