
export interface MinerData {
  id: string;
  name: string;
  description: string;
  image: string;
  hourlyRate: number;
  baseDailyPrice: number;
}

export const miners: MinerData[] = [
  {
    id: "free-miner",
    name: "Free Miner",
    description: "Basic mining equipment for beginners",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
    hourlyRate: 0.1,
    baseDailyPrice: 0 // Free miner
  },
  {
    id: "epic-miner",
    name: "Epic Miner",
    description: "Advanced mining equipment for serious miners",
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop",
    hourlyRate: 0.8,
    baseDailyPrice: 15
  },
  {
    id: "super-miner",
    name: "Super Miner",
    description: "High-performance mining with excellent returns",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop",
    hourlyRate: 8,
    baseDailyPrice: 150
  },
  {
    id: "legendary-miner",
    name: "Legendary Miner",
    description: "The ultimate mining machine for maximum profits",
    image: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc?w=400&h=300&fit=crop",
    hourlyRate: 40,
    baseDailyPrice: 600
  }
];
