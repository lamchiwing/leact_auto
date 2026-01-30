
export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  details: string[];
  price: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
