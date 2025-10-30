import { URL as API_URL } from '@/api/config';

// Utility function to enrich comments with user information
export const enrichCommentsWithUserInfo = async (comments: any[]): Promise<any[]> => {
  if (!comments || comments.length === 0) {
    return comments;
  }

  try {
    // Get unique user IDs from comments
    const userIds = [...new Set(comments.map(comment => comment.userid).filter(Boolean))];
    
    if (userIds.length === 0) {
      return comments;
    }

    // Fetch user information for all commenters
    const userPromises = userIds.map(async (userId) => {
      try {
        const response = await fetch(`${API_URL}/getprofilebyid`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userid: userId })
        });
        
        if (response.ok) {
          const userData = await response.json();
          return { userId, userData };
        }
        return { userId, userData: null };
      } catch (error) {
        console.error(`Error fetching user info for ${userId}:`, error);
        return { userId, userData: null };
      }
    });

    const userResults = await Promise.all(userPromises);
    const userMap = new Map();
    
    userResults.forEach(({ userId, userData }) => {
      if (userData && userData.user) {
        userMap.set(userId, userData.user);
      }
    });

    // Enrich comments with user information
    const enrichedComments = comments.map(comment => {
      const user = userMap.get(comment.userid);
      
      if (user) {
        const enrichedComment = {
          ...comment,
          commentuserphoto: user.photolink || user.photoLink || user.profileImage || user.avatar || user.image || "",
          commentusername: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
          commentusername: user.username || "",
          commentuserid: user._id,
          isVip: user.isVip || false,
          vipStartDate: user.vipStartDate,
          vipEndDate: user.vipEndDate
        };
        
        
        return enrichedComment;
      }
      
      return comment;
    });


    return enrichedComments;
  } catch (error) {
    console.error('Error enriching comments:', error);
    return comments;
  }
};
