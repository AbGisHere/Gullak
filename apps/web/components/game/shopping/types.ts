export interface ShoppingItem {
  id: string;
  name: string;
  pricePaise: number; // e.g. 2000 for ₹20
  category: "need" | "want";
  icon: string;
  description: string;
  temptationBadge?: string;
  gulluReaction: {
    state: "happy" | "curious" | "concerned" | "thinking";
    message: string;
  };
}

export interface BasketItem extends ShoppingItem {
  cartId: string;
}

export const KIRANA_ITEMS: ShoppingItem[] = [
  {
    id: "notebook",
    name: "Class Notebook",
    pricePaise: 2000, // ₹20
    category: "need",
    icon: "📓",
    description: "Required for tomorrow's math & science homework.",
    gulluReaction: {
      state: "happy",
      message: "Spot on! Amma specifically sent us for this school notebook.",
    },
  },
  {
    id: "pencil",
    name: "Pencil & Eraser",
    pricePaise: 500, // ₹5
    category: "need",
    icon: "✏️",
    description: "Essential for writing notes and homework.",
    gulluReaction: {
      state: "happy",
      message: "Very sensible! A ₹5 pencil helps you finish schoolwork.",
    },
  },
  {
    id: "kite",
    name: "Special Paper Kite",
    pricePaise: 1500, // ₹15
    category: "want",
    icon: "🪁",
    description: "Colourful fighter kite with glass manja spool.",
    temptationBadge: "Last one before festival!",
    gulluReaction: {
      state: "curious",
      message: "Ooh! That kite looks so tempting! But do we still have ₹10 for the bus home?",
    },
  },
  {
    id: "chocolate",
    name: "Cream Chocolate",
    pricePaise: 1000, // ₹10
    category: "want",
    icon: "🍫",
    description: "Sweet cocoa treat on the front counter.",
    gulluReaction: {
      state: "thinking",
      message: "Yummy chocolate! Remember: it's a want. Have we funded our bus fare first?",
    },
  },
  {
    id: "chips",
    name: "Crispy Masala Chips",
    pricePaise: 1000, // ₹10
    category: "want",
    icon: "🍟",
    description: "Spicy crunch snack hanging on the wire rack.",
    gulluReaction: {
      state: "curious",
      message: "Smells delicious! Fun snack, but eating chips won't get you on the bus.",
    },
  },
  {
    id: "cold-drink",
    name: "Chilled Soda Bottle",
    pricePaise: 2000, // ₹20
    category: "want",
    icon: "🥤",
    description: "Cold fizz drink in the glass cooler.",
    gulluReaction: {
      state: "concerned",
      message: "₹20 for soda! That's almost half our money! We might run out of bus fare.",
    },
  },
  {
    id: "stickers",
    name: "Cricket Stars Stickers",
    pricePaise: 1000, // ₹10
    category: "want",
    icon: "⭐",
    description: "Glossy sticker pack for school geometry box.",
    gulluReaction: {
      state: "thinking",
      message: "Cool stickers! Nice to collect, but our school notebook comes first.",
    },
  },
];

export interface ApplyQuestion {
  id: string;
  prompt: string;
  category: "need" | "want";
  explanation: string;
}

export const APPLY_QUESTIONS: ApplyQuestion[] = [
  {
    id: "q1",
    prompt: "New school shoes because the sole of your old shoes ripped in monsoon rain.",
    category: "need",
    explanation: "Essential! You need footwear to walk to school safely and meet uniform rules.",
  },
  {
    id: "q2",
    prompt: "An animated video game skin or virtual battle badge for your phone profile.",
    category: "want",
    explanation: "Fun extra! It feels cool to show friends, but you can learn and live safely without it.",
  },
  {
    id: "q3",
    prompt: "Cough syrup and doctor-prescribed medicine when you have a high fever.",
    category: "need",
    explanation: "Critical need! Protecting health and recovery always comes before treats.",
  },
];
