import { User } from '../types/user';

export const mockFollowData = {
  followers: [
    { id: '1', name: 'Sarah Johnson', image: 'https://picsum.photos/64/64?random=20', canmessage: true, creator_portfolio_id: 'creator1', following: false },
    { id: '2', name: 'Emma Wilson', image: 'https://picsum.photos/64/64?random=21', canmessage: true, creator_portfolio_id: 'creator2', following: false },
    { id: '3', name: 'Jessica Brown', image: 'https://picsum.photos/64/64?random=22', canmessage: true, creator_portfolio_id: 'creator3', following: false }
  ],
  following: [
    { id: '4', name: 'Alex Smith', image: 'https://picsum.photos/64/64?random=23', canmessage: true, creator_portfolio_id: 'creator4', following: true },
    { id: '5', name: 'Taylor Davis', image: 'https://picsum.photos/64/64?random=24', canmessage: true, creator_portfolio_id: 'creator5', following: true },
    { id: '6', name: 'Jordan Miller', image: 'https://picsum.photos/64/64?random=25', canmessage: true, creator_portfolio_id: 'creator6', following: true }
  ]
};