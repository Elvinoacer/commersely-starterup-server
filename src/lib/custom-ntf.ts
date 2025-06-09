export const baseUrl = "http://localhost:3000";
export const allLinks = {
  socialLinks: {
    facebook: "https://www.facebook.com/profile.php?id=100092661322616",
    instagram: "https://www.instagram.com/",
    twitter: "https://x.com/Elvinoace",
  },
  pageLinks: {
    unsubsribe: "#",
    privacy: "http://localhost:3000/privacy",
    allProducts: "http://localhost:3000/listing",
  },
};

export const NOTIFICATIONDATA = {
  ADDED_PRODUCT: {
    title: `It's Here! Discover the Latest from Our New Collection.`,
    smallDescription:
      "Fresh styles and new arrivals are waiting for you. Be the first to explore.",
    text: "Hello, \n\nGet ready to refresh your favorites! Our brand-new collection has just landed. From everyday essentials to standout pieces, there's something for everyone. \n\nWe've been working hard to bring you products you'll love, and we're so excited to finally share them with you. \n\nExplore the full collection and find your next favorite piece. \n\nHappy Shopping!",
    allProducts: `${baseUrl}/listing`,
  },
  REMOVED_CATEGORY: {
    title: "Important Update: A Category Has Been Removed.",
    smallDescription:
      "We've streamlined our categories. The products you love might have moved!",
    text: "Hello, \n\nWe're always working to improve your shopping experience. As part of these efforts, we've decided to remove one of our product categories. This change helps us organize our offerings more effectively and make it easier for you to find what you're looking for.\n\nIf you had a favorite item in this category, don't worry! Many of these products have been relocated to other relevant sections of our store. Please explore our updated categories to find them, or use our search bar.\n\nWe appreciate your understanding and are here to help if you have any questions.\n\nHappy Shopping!",
  },
  UPDATED_CATEGORY: {
    title: "Exciting Changes! Check Out Our Updated Category.",
    smallDescription:
      "A favorite category just got better! Discover new additions and improvements.",
    text: "Hello, \n\nWe've been busy making improvements! One of your favorite product categories has just been updated with exciting new additions and refinements. Whether it's new products, a refreshed look, or improved navigation, we think you'll love what we've done.\n\nDive in and explore the enhanced category. You might discover a new must-have!\n\nWe're committed to continually improving your shopping experience.\n\nHappy Shopping!",
  },
  OUT_OF_STOCK: {
    title: "Heads Up! An Item You Love Is Temporarily Out of Stock.",
    smallDescription:
      "The item you're looking for is currently unavailable. Sign up for restock alerts!",
    text: "Hello, \n\nWe wanted to let you know that an item you recently viewed or added to your wishlist is currently out of stock. We apologize for any inconvenience this may cause.\n\nWe're working hard to replenish our inventory as quickly as possible. In the meantime, you can:\n\n1. **Sign up for restock notifications:** Be the first to know when it's back!\n2. **Browse similar products:** We have many other fantastic items you might love.\n\nThank you for your patience and understanding. We appreciate your business!\n\nSincerely,\nThe Team",
  },
};

export enum NotificationAction {
  ADDED_PRODUCT = "ADDED_PRODUCT",
  REMOVED_CATEGORY = "REMOVED_CATEGORY",
  UPDATED_CATEGORY = "UPDATED_CATEGORY",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  ADDED_COLLECTION = "ADDED_COLLECTION",
}
