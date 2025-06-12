import {
  users,
  wardrobeItems,
  outfits,
  socialPosts,
  postLikes,
  sustainableBrands,
  type User,
  type UpsertUser,
  type WardrobeItem,
  type InsertWardrobeItem,
  type Outfit,
  type InsertOutfit,
  type SocialPost,
  type InsertSocialPost,
  type SustainableBrand,
  type PostLike,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Wardrobe operations
  getWardrobeItems(userId: string): Promise<WardrobeItem[]>;
  getWardrobeItemsByCategory(userId: string, category: string): Promise<WardrobeItem[]>;
  createWardrobeItem(item: InsertWardrobeItem): Promise<WardrobeItem>;
  updateWardrobeItem(id: number, updates: Partial<WardrobeItem>): Promise<WardrobeItem>;
  deleteWardrobeItem(id: number): Promise<void>;
  incrementWearCount(itemId: number): Promise<void>;
  
  // Outfit operations
  getOutfits(userId: string): Promise<Outfit[]>;
  getPublicOutfits(): Promise<(Outfit & { user: User })[]>;
  createOutfit(outfit: InsertOutfit): Promise<Outfit>;
  updateOutfit(id: number, updates: Partial<Outfit>): Promise<Outfit>;
  deleteOutfit(id: number): Promise<void>;
  
  // Social operations
  getSocialPosts(): Promise<(SocialPost & { user: User; isLiked?: boolean })[]>;
  getUserSocialPosts(userId: string): Promise<SocialPost[]>;
  createSocialPost(post: InsertSocialPost): Promise<SocialPost>;
  likePost(userId: string, postId: number): Promise<void>;
  unlikePost(userId: string, postId: number): Promise<void>;
  
  // Sustainability operations
  getSustainableBrands(): Promise<SustainableBrand[]>;
  
  // Analytics
  getWardrobeStats(userId: string): Promise<{
    totalItems: number;
    totalOutfits: number;
    sustainabilityScore: number;
    averageCostPerWear: number;
    mostWornCategory: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Wardrobe operations
  async getWardrobeItems(userId: string): Promise<WardrobeItem[]> {
    return await db
      .select()
      .from(wardrobeItems)
      .where(eq(wardrobeItems.userId, userId))
      .orderBy(desc(wardrobeItems.createdAt));
  }

  async getWardrobeItemsByCategory(userId: string, category: string): Promise<WardrobeItem[]> {
    return await db
      .select()
      .from(wardrobeItems)
      .where(and(eq(wardrobeItems.userId, userId), eq(wardrobeItems.category, category)))
      .orderBy(desc(wardrobeItems.createdAt));
  }

  async createWardrobeItem(item: InsertWardrobeItem): Promise<WardrobeItem> {
    const [newItem] = await db.insert(wardrobeItems).values(item).returning();
    return newItem;
  }

  async updateWardrobeItem(id: number, updates: Partial<WardrobeItem>): Promise<WardrobeItem> {
    const [updated] = await db
      .update(wardrobeItems)
      .set(updates)
      .where(eq(wardrobeItems.id, id))
      .returning();
    return updated;
  }

  async deleteWardrobeItem(id: number): Promise<void> {
    await db.delete(wardrobeItems).where(eq(wardrobeItems.id, id));
  }

  async incrementWearCount(itemId: number): Promise<void> {
    await db
      .update(wardrobeItems)
      .set({
        timesWorn: sql`${wardrobeItems.timesWorn} + 1`,
        lastWorn: new Date(),
      })
      .where(eq(wardrobeItems.id, itemId));
  }

  // Outfit operations
  async getOutfits(userId: string): Promise<Outfit[]> {
    return await db
      .select()
      .from(outfits)
      .where(eq(outfits.userId, userId))
      .orderBy(desc(outfits.createdAt));
  }

  async getPublicOutfits(): Promise<(Outfit & { user: User })[]> {
    return await db
      .select({
        id: outfits.id,
        userId: outfits.userId,
        name: outfits.name,
        occasion: outfits.occasion,
        weather: outfits.weather,
        items: outfits.items,
        isPublic: outfits.isPublic,
        likes: outfits.likes,
        createdAt: outfits.createdAt,
        user: users,
      })
      .from(outfits)
      .innerJoin(users, eq(outfits.userId, users.id))
      .where(eq(outfits.isPublic, true))
      .orderBy(desc(outfits.createdAt));
  }

  async createOutfit(outfit: InsertOutfit): Promise<Outfit> {
    const [newOutfit] = await db.insert(outfits).values(outfit).returning();
    return newOutfit;
  }

  async updateOutfit(id: number, updates: Partial<Outfit>): Promise<Outfit> {
    const [updated] = await db
      .update(outfits)
      .set(updates)
      .where(eq(outfits.id, id))
      .returning();
    return updated;
  }

  async deleteOutfit(id: number): Promise<void> {
    await db.delete(outfits).where(eq(outfits.id, id));
  }

  // Social operations
  async getSocialPosts(): Promise<(SocialPost & { user: User; isLiked?: boolean })[]> {
    return await db
      .select({
        id: socialPosts.id,
        userId: socialPosts.userId,
        outfitId: socialPosts.outfitId,
        caption: socialPosts.caption,
        imageUrl: socialPosts.imageUrl,
        tags: socialPosts.tags,
        likes: socialPosts.likes,
        createdAt: socialPosts.createdAt,
        user: users,
      })
      .from(socialPosts)
      .innerJoin(users, eq(socialPosts.userId, users.id))
      .orderBy(desc(socialPosts.createdAt))
      .limit(50);
  }

  async getUserSocialPosts(userId: string): Promise<SocialPost[]> {
    return await db
      .select()
      .from(socialPosts)
      .where(eq(socialPosts.userId, userId))
      .orderBy(desc(socialPosts.createdAt));
  }

  async createSocialPost(post: InsertSocialPost): Promise<SocialPost> {
    const [newPost] = await db.insert(socialPosts).values(post).returning();
    return newPost;
  }

  async likePost(userId: string, postId: number): Promise<void> {
    // Check if already liked
    const [existingLike] = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));

    if (!existingLike) {
      await db.insert(postLikes).values({ userId, postId });
      await db
        .update(socialPosts)
        .set({ likes: sql`${socialPosts.likes} + 1` })
        .where(eq(socialPosts.id, postId));
    }
  }

  async unlikePost(userId: string, postId: number): Promise<void> {
    const deleted = await db
      .delete(postLikes)
      .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));

    if (deleted) {
      await db
        .update(socialPosts)
        .set({ likes: sql`${socialPosts.likes} - 1` })
        .where(eq(socialPosts.id, postId));
    }
  }

  // Sustainability operations
  async getSustainableBrands(): Promise<SustainableBrand[]> {
    return await db
      .select()
      .from(sustainableBrands)
      .orderBy(desc(sustainableBrands.sustainabilityScore));
  }

  // Analytics
  async getWardrobeStats(userId: string): Promise<{
    totalItems: number;
    totalOutfits: number;
    sustainabilityScore: number;
    averageCostPerWear: number;
    mostWornCategory: string;
  }> {
    const items = await this.getWardrobeItems(userId);
    const userOutfits = await this.getOutfits(userId);
    
    const totalItems = items.length;
    const totalOutfits = userOutfits.length;
    
    const sustainableItems = items.filter(item => item.isSustainable || item.isEthical).length;
    const sustainabilityScore = totalItems > 0 ? Math.round((sustainableItems / totalItems) * 100) : 0;
    
    const itemsWithCost = items.filter(item => item.purchasePrice && (item.timesWorn || 0) > 0);
    const averageCostPerWear = itemsWithCost.length > 0 
      ? itemsWithCost.reduce((sum, item) => sum + (Number(item.purchasePrice) / (item.timesWorn || 1)), 0) / itemsWithCost.length
      : 0;
    
    const categoryWears = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + (item.timesWorn || 0);
      return acc;
    }, {} as Record<string, number>);
    
    const mostWornCategory = Object.entries(categoryWears).reduce((a, b) => 
      categoryWears[a[0]] > categoryWears[b[0]] ? a : b, ['tops', 0])[0];
    
    return {
      totalItems,
      totalOutfits,
      sustainabilityScore,
      averageCostPerWear: Math.round(averageCostPerWear * 100) / 100,
      mostWornCategory,
    };
  }
}

export const storage = new DatabaseStorage();
