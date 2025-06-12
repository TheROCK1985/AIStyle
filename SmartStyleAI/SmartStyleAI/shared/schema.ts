import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wardrobe items
export const wardrobeItems = pgTable("wardrobe_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(), // tops, bottoms, dresses, shoes, accessories
  color: varchar("color"),
  brand: varchar("brand"),
  imageUrl: varchar("image_url"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  isEthical: boolean("is_ethical").default(false),
  isSustainable: boolean("is_sustainable").default(false),
  timesWorn: integer("times_worn").default(0),
  lastWorn: timestamp("last_worn"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Outfits
export const outfits = pgTable("outfits", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  occasion: varchar("occasion"), // work, casual, date, party, travel
  weather: varchar("weather"),
  items: jsonb("items").notNull(), // array of wardrobe item IDs
  isPublic: boolean("is_public").default(false),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Social posts
export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  outfitId: integer("outfit_id").references(() => outfits.id),
  caption: text("caption"),
  imageUrl: varchar("image_url"),
  tags: jsonb("tags"), // array of hashtags
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post likes
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: integer("post_id").notNull().references(() => socialPosts.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sustainable brands
export const sustainableBrands = pgTable("sustainable_brands", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  logoUrl: varchar("logo_url"),
  websiteUrl: varchar("website_url"),
  certifications: jsonb("certifications"), // array of certifications
  categories: jsonb("categories"), // array of product categories
  sustainabilityScore: integer("sustainability_score"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  wardrobeItems: many(wardrobeItems),
  outfits: many(outfits),
  socialPosts: many(socialPosts),
  postLikes: many(postLikes),
}));

export const wardrobeItemsRelations = relations(wardrobeItems, ({ one }) => ({
  user: one(users, {
    fields: [wardrobeItems.userId],
    references: [users.id],
  }),
}));

export const outfitsRelations = relations(outfits, ({ one, many }) => ({
  user: one(users, {
    fields: [outfits.userId],
    references: [users.id],
  }),
  socialPosts: many(socialPosts),
}));

export const socialPostsRelations = relations(socialPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [socialPosts.userId],
    references: [users.id],
  }),
  outfit: one(outfits, {
    fields: [socialPosts.outfitId],
    references: [outfits.id],
  }),
  likes: many(postLikes),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
  post: one(socialPosts, {
    fields: [postLikes.postId],
    references: [socialPosts.id],
  }),
}));

// Insert schemas
export const insertWardrobeItemSchema = createInsertSchema(wardrobeItems).omit({
  id: true,
  createdAt: true,
  timesWorn: true,
  lastWorn: true,
});

export const insertOutfitSchema = createInsertSchema(outfits).omit({
  id: true,
  createdAt: true,
  likes: true,
});

export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({
  id: true,
  createdAt: true,
  likes: true,
});

export const upsertUserSchema = createInsertSchema(users);

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type WardrobeItem = typeof wardrobeItems.$inferSelect;
export type InsertWardrobeItem = z.infer<typeof insertWardrobeItemSchema>;
export type Outfit = typeof outfits.$inferSelect;
export type InsertOutfit = z.infer<typeof insertOutfitSchema>;
export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
export type SustainableBrand = typeof sustainableBrands.$inferSelect;
export type PostLike = typeof postLikes.$inferSelect;
