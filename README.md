# MMEKO - Creator-Fan Platform

A comprehensive platform connecting creators with fans through various interaction methods including video calls, meetups, and messaging.

## Table of Contents

1. [Creator Request System](#creator-request-system)
2. [Messaging System](#messaging-system)
3. [Support Chat System](#support-chat-system)
4. [Following System](#following-system)
5. [Profile Management](#profile-management)
6. [Post Interactions](#post-interactions)
7. [Gold System](#gold-system)
8. [VIP System](#vip-system)
9. [Admin Panel](#admin-panel)

---

## Creator Request System

### Overview
The creator request system allows fans to request different types of interactions with creators, including Fan Calls, Fan Meets, and Fan Dates.

### Backend Request Controllers (`mmekoapi/Controller/Request/`)

#### 1. Request Controllers

##### `createrequest.js`
- **Endpoint**: `POST /request`
- **Purpose**: Create new fan requests for creators
- **Features**:
  - Request validation and gold balance checking
  - Date/time validation for availability
  - Request state initialization (pending)
  - Real-time notifications to creators
  - VIP status inclusion in request data

##### `acceptrequest.js`
- **Endpoint**: `PUT /acceptrequest`
- **Purpose**: Accept fan requests by creators
- **Features**:
  - Request status update (pending → accepted)
  - 48-hour timer initialization for Fan Calls
  - Real-time notifications to fans
  - Gold reservation and payment processing
  - Safety rules agreement for Fan Meets

##### `declinerequest.js`
- **Endpoint**: `PUT /declinerequest`
- **Purpose**: Decline fan requests by creators
- **Features**:
  - Request status update (pending → declined)
  - Gold refund processing
  - Real-time notifications to fans
  - Request history logging

##### `completerequest.js`
- **Endpoint**: `PUT /completerequest`
- **Purpose**: Mark requests as completed
- **Features**:
  - Request status update (accepted → completed)
  - Gold transfer to creator
  - Rating system activation
  - Completion confirmation
  - Earnings calculation

##### `cancelrequest.js`
- **Endpoint**: `PUT /cancelrequest`
- **Purpose**: Cancel requests (by fan or creator)
- **Features**:
  - Request status update (any → cancelled)
  - Gold refund processing
  - Cancellation reason tracking
  - Real-time notifications

##### `expirerequest.js`
- **Endpoint**: `PUT /expirerequest`
- **Purpose**: Handle expired requests
- **Features**:
  - Automatic expiration after 24 hours (pending)
  - Automatic expiration after 48 hours (Fan Call accepted)
  - Gold refund processing
  - Expiration notifications

#### 2. Request Data Structure

```javascript
{
  _id: "request_id",
  fanId: "fan_user_id",
  creatorId: "creator_user_id",
  hostType: "Fan Call|Fan Meet|Fan Date",
  date: "requested_date",
  time: "requested_time",
  venue: "meeting_location",
  duration: "meeting_duration",
  amount: "gold_amount",
  status: "pending|accepted|declined|completed|cancelled|expired",
  createdAt: "creation_timestamp",
  acceptedAt: "acceptance_timestamp",
  completedAt: "completion_timestamp",
  isVip: false, // creator's VIP status
  vipStartDate: "date",
  vipEndDate: "date"
}
```

#### 3. Request Flow

##### 1. Request Creation (`/creators/[creator_portfolio_id]/page.tsx`)
- **Fan initiates request**: Fan clicks "Request [Host Type]" button
- **Request details form**: Fan fills out date, time, and venue details
- **Gold balance check**: System verifies fan has sufficient gold balance
- **Request submission**: Request sent to backend with creator and fan details
- **Real-time notification**: Creator receives instant notification

##### 2. Request Processing (`/notifications/components/RequestCard.tsx`)
- **Request states**: `request` → `accepted`/`declined` → `completed`/`cancelled`/`expired`
- **Creator actions**: Accept/Decline requests within 24 hours
- **Fan actions**: Cancel requests, mark as complete, start video calls
- **Real-time updates**: Socket.io integration for instant status updates

##### 3. Service Types

###### Fan Call
- **Video call functionality**: WebRTC integration for real-time video calls
- **Billing**: Per-minute gold deduction during active calls
- **Duration**: 48-hour window to start call after acceptance
- **Features**: VIP badge display, call quality indicators
- **Backend**: `payclient_PCALL.js` handles per-minute billing

###### Fan Meet/Fan Date
- **In-person meetings**: 30-minute maximum duration
- **Safety rules**: Public places only, platform responsibility limited
- **Gold transfer**: Pending gold released to creator upon completion
- **Location tracking**: Venue and time coordination
- **Backend**: `paycreator.js` handles gold transfer upon completion

### Request States
```
request → accepted → completed
    ↓         ↓         ↓
expired   declined  cancelled
```

---

## Messaging System

### Overview
Real-time messaging system between fans and creators with support for text, images, and notifications.

### Backend Message Controller (`mmekoapi/Controller/Message/`)

#### 1. Message Controllers

##### `sendmessage.js`
- **Endpoint**: `POST /sendmessage`
- **Purpose**: Send new messages between users
- **Features**:
  - Real-time message delivery via Socket.io
  - Message persistence in database
  - File attachment support
  - Message status tracking (sending → sent → delivered)
  - VIP badge inclusion in message data
  - Online status validation

##### `getcurrentchat.js`
- **Endpoint**: `PUT /getcurrentchat`
- **Purpose**: Retrieve chat history between two users
- **Features**:
  - Fetch complete message history
  - Pagination support for large chat histories
  - Message status tracking
  - File attachment retrieval
  - User authentication validation

##### `getallmessage.js`
- **Endpoint**: `GET /getallmessage`
- **Purpose**: Get all conversations for a user
- **Features**:
  - List all active conversations
  - Last message preview
  - Unread message counts
  - Conversation metadata

##### `deletemessage.js`
- **Endpoint**: `DELETE /deletemessage`
- **Purpose**: Delete specific messages
- **Features**:
  - Message deletion by ID
  - Soft delete implementation
  - Permission validation (user can only delete own messages)
  - Real-time deletion notifications

##### `updatemessage.js`
- **Endpoint**: `PUT /updatemessage`
- **Purpose**: Update message content or status
- **Features**:
  - Edit message content
  - Update message status (read, delivered)
  - Message timestamp updates
  - Real-time status updates

#### 2. Message Data Structure

```javascript
{
  _id: "message_id",
  fromid: "sender_user_id",
  toid: "recipient_user_id", 
  content: "message_content",
  date: "timestamp",
  coin: false, // true for gold/gift messages
  files: ["file_urls"], // for attachments
  fileCount: 0,
  messageId: "unique_message_identifier",
  status: "sending|sent|delivered|failed",
  isVip: false, // sender's VIP status
  vipStartDate: "date",
  vipEndDate: "date"
}
```

#### 3. Socket.io Integration

##### Real-time Events
- **`message`**: Send new messages
- **`LiveChat`**: Receive new messages
- **`typing_start`**: User started typing
- **`typing_stop`**: User stopped typing
- **`online`**: User came online
- **`offline`**: User went offline

##### Message Flow
1. **Frontend** sends message via Socket.io `message` event
2. **Backend** processes message and saves to database
3. **Backend** emits `LiveChat` event to recipient
4. **Frontend** receives message and updates UI
5. **Status updates** sent for message delivery confirmation

### Creator Discovery & Ranking (`/creators/`)

#### 1. Creator Portfolio Display
- **Portfolio cards**: Visual creator profiles with photos, details, and pricing
- **Category filtering**: Filter by Fan Call, Fan Meet, Fan Date, or view All
- **Real-time data**: Live creator information and availability

#### 2. Creator Ranking System
The platform uses a **online + views + following** ranking system:

**Ranking Priority:**
1. **Online Status** (highest priority - online users appear first)
2. **Views Count** (higher views first within each group)
3. **Following Status** (followed users first within same views)
4. **Creation Date** (newest first as final tiebreaker)

**Examples:**
- Creator A: **Online**, 1000 views, **Following** → 1st place
- Creator B: **Online**, 500 views, **Following** → 2nd place  
- Creator C: **Online**, 2000 views, **Not Following** → 3rd place
- Creator D: **Offline**, 1500 views, **Following** → 4th place
- Creator E: **Offline**, 3000 views, **Not Following** → 5th place

**Key Rules:**
- **Online status** takes highest priority
- **View count** is second priority (highest first)
- **Following status** is third priority
- **Creation date** is final tiebreaker (newest first)

This ensures that online creators always appear first, followed by offline creators, then sorted by popularity (views) and following status.

#### 3. Creator Features
- **VIP badges**: Special indicators for premium creators
- **Online indicators**: Real-time online/offline status
- **Profile photos**: Multiple photos with navigation
- **Service details**: Pricing, duration, and availability

### Frontend Message Features (`/message/`)

#### 1. Direct Messaging (`/message/_components/Chat.tsx`)
- **Real-time chat**: Socket.io powered instant messaging
- **Message history**: Persistent chat history storage
- **Online status**: Real-time user presence indicators
- **File sharing**: Image and document sharing capabilities
- **Typing indicators**: Real-time typing status
- **Message status**: Sending, sent, delivered, failed indicators
- **VIP celebration**: Special animations for VIP users

#### 2. Message Types
- **Text messages**: Standard text communication
- **Media messages**: Image and file attachments with preview
- **System messages**: Platform notifications and updates
- **Call notifications**: Video call related messages
- **Gold messages**: Special gold/gift messages with coin indicators

#### 3. Message Management
- **Message threading**: Organized conversation flow
- **Block/Unblock**: User blocking functionality
- **Message retry**: Retry failed message delivery
- **File preview**: Preview images and documents before sending
- **Message search**: Search through message history

---

## Support Chat System

### Overview
Dedicated support system for users to get help from platform administrators.

### Backend Support Controllers (`mmekoapi/Controller/SupportChat/`)

#### 1. Support Controllers

##### `createsupportchat.js`
- **Endpoint**: `POST /supportchat`
- **Purpose**: Create new support chat requests
- **Features**:
  - Support category validation
  - User authentication and authorization
  - Support ticket initialization
  - Priority assignment (VIP users get higher priority)
  - Real-time notifications to admin team

##### `getsupportchat.js`
- **Endpoint**: `GET /supportchat/:userId`
- **Purpose**: Retrieve user's support chat history
- **Features**:
  - Fetch all support conversations for a user
  - Message history with timestamps
  - Status tracking (open, pending, closed)
  - Category filtering
  - Pagination support

##### `admingetsupportchat.js`
- **Endpoint**: `GET /admin/supportchat`
- **Purpose**: Admin endpoint to get all support chats
- **Features**:
  - Fetch all support requests across the platform
  - Priority sorting (VIP users first)
  - Status filtering (open, pending, closed)
  - Category filtering
  - Search functionality
  - Pagination and sorting

##### `respondsupportchat.js`
- **Endpoint**: `PUT /supportchat/respond`
- **Purpose**: Admin response to support chats
- **Features**:
  - Admin authentication and authorization
  - Message response with admin identification
  - Status updates (open → pending → closed)
  - Real-time notifications to users
  - Response tracking and logging

##### `updatesupportstatus.js`
- **Endpoint**: `PUT /supportchat/status`
- **Purpose**: Update support chat status
- **Features**:
  - Status transitions (open, pending, closed)
  - Admin authorization required
  - Status change notifications
  - Audit trail for status changes

#### 2. Support Data Structure

```javascript
{
  _id: "support_chat_id",
  userId: "user_id",
  category: "Account Issues|Payment & Billing|Technical Support|Feature Request|Bug Report|Report a Fan|Report a Creator|Other",
  subject: "support_subject",
  messages: [
    {
      _id: "message_id",
      senderId: "user_id|admin_id",
      senderType: "user|admin",
      content: "message_content",
      timestamp: "message_timestamp",
      isRead: false
    }
  ],
  status: "open|pending|closed",
  priority: "normal|high|urgent", // VIP users get high priority
  createdAt: "creation_timestamp",
  updatedAt: "last_update_timestamp",
  closedAt: "closure_timestamp",
  assignedAdmin: "admin_id"
}
```

#### 3. Support Flow

##### 1. User Support (`/message/supportchat/`)
- **Category selection**: Users choose appropriate support category
- **Message submission**: Detailed description of the issue
- **Status tracking**: Open → Pending → Closed status progression
- **Real-time updates**: Instant notifications for support responses
- **Priority handling**: VIP users automatically get higher priority

##### 2. Admin Support (`/mmeko/admin/support-chat/`)
- **Chat management**: View and respond to all support requests
- **Priority handling**: VIP users get priority in support queue
- **Status management**: Mark chats as open, pending, or closed
- **Category filtering**: Filter support requests by category
- **Search functionality**: Find specific support conversations
- **Bulk actions**: Handle multiple support requests
- **Escalation system**: Escalate complex issues to higher support levels
- **Analytics**: Support request statistics and trends

#### 4. Support Categories
- **Account Issues**: Login, profile, account-related problems
- **Payment & Billing**: Payment methods, billing, transaction issues
- **Technical Support**: App bugs, technical difficulties, performance issues
- **Feature Request**: Suggestions for new features or improvements
- **Bug Report**: Report bugs or unexpected behavior
- **Report a Fan**: Report inappropriate behavior from fans
- **Report a Creator**: Report inappropriate behavior from creators
- **Other**: Any other questions or concerns

---

## Following System

### Overview
Social following system allowing users to follow creators and stay updated with their content.

### Backend Following Controllers (`mmekoapi/Controller/Follower/`)

#### 1. Following Controllers

##### `get_followers.js`
- **Endpoint**: `GET /getfollowers`
- **Purpose**: Get user's followers and following lists
- **Features**:
  - Fetch followers list (users who follow the current user)
  - Fetch following list (users the current user follows)
  - Mutual follow detection
  - Blocked user filtering
  - User profile information inclusion
  - Online status indicators

##### `updateFollowers.js`
- **Endpoint**: `PUT /creators` (follow/unfollow)
- **Purpose**: Follow or unfollow creators
- **Features**:
  - Toggle follow/unfollow status
  - Real-time follow status updates
  - Follow notifications to creators
  - Email notifications for new followers
  - Push notifications for follow events
  - Follower count updates

##### `get_following.js`
- **Endpoint**: `GET /getfollowing`
- **Purpose**: Get detailed following information
- **Features**:
  - Following list with creator details
  - Creator portfolio information
  - Online status for followed creators
  - VIP status indicators
  - Recent activity tracking

#### 2. Following Data Structure

```javascript
{
  _id: "follower_relationship_id",
  followerId: "user_who_follows",
  followingId: "user_being_followed",
  createdAt: "follow_timestamp",
  isActive: true, // for soft delete
  notifications: {
    email: true,
    push: true,
    inApp: true
  }
}

// User document includes:
{
  followers: ["user_id_array"], // users who follow this user
  following: ["user_id_array"], // users this user follows
  followerCount: 0,
  followingCount: 0
}
```

#### 3. Following Features (`/following/`)

##### 1. Follow Management
- **Follow/Unfollow**: Toggle following status for creators
- **Following list**: View all followed creators with real-time data
- **Follower count**: Track number of followers with live updates
- **Follow notifications**: Notify creators of new followers via email and push

##### 2. Following Benefits
- **Priority messaging**: Direct messaging with followed creators
- **Activity feed**: See followed creators' activities and updates
- **Creator ranking**: Followed creators appear higher in creator listings
- **Exclusive content**: Access to content from followed creators

##### 3. Discovery Features
- **Trending creators**: Popular creators on the platform
- **Category browsing**: Find creators by interests/categories
- **Search functionality**: Search for specific creators
- **Mutual connections**: See creators followed by people you follow
- **Recommendations**: Suggested creators based on your interests

#### 4. Following Flow
1. **User clicks follow**: Frontend sends follow request to backend
2. **Backend processes**: Updates follower/following arrays in user documents
3. **Notifications sent**: Creator receives email and push notifications
4. **Real-time updates**: Socket.io updates follower counts and status
5. **UI updates**: Frontend reflects new follow status immediately

---

## Profile Management

### Overview
Comprehensive profile system for both creators and fans with detailed information and customization options.

### Backend Profile Controllers (`mmekoapi/Controller/profile/`)

#### 1. Profile Controllers

##### `getprofilebyID.js`
- **Endpoint**: `GET /profile/:userId`
- **Purpose**: Get user profile information
- **Features**:
  - Complete profile data retrieval
  - Creator portfolio information
  - VIP status and expiration dates
  - Following status for current user
  - View count tracking
  - Online status indicators

##### `getprofile.js`
- **Endpoint**: `GET /getprofile`
- **Purpose**: Get current user's own profile
- **Features**:
  - Personal profile data
  - Creator portfolio details
  - Earnings and statistics
  - VIP status information
  - Account settings

##### `updateprofile.js`
- **Endpoint**: `PUT /updateprofile`
- **Purpose**: Update user profile information
- **Features**:
  - Profile information updates
  - Photo upload and management
  - Privacy settings updates
  - Notification preferences
  - Account verification

##### `deleteprofile.js`
- **Endpoint**: `DELETE /deleteprofile`
- **Purpose**: Delete user profile
- **Features**:
  - Profile deletion with confirmation
  - Data cleanup and archiving
  - Related data removal (posts, messages, etc.)
  - Account deactivation

##### `getBlockedacc.js`
- **Endpoint**: `GET /getblocked`
- **Purpose**: Get blocked users list
- **Features**:
  - List of blocked users
  - Block/unblock functionality
  - Block reason tracking
  - Privacy protection

#### 2. Profile Data Structure

```javascript
{
  _id: "user_id",
  firstname: "user_first_name",
  lastname: "user_last_name",
  nickname: "user_nickname",
  bio: "user_bio",
  photolink: "profile_photo_url",
  gender: "Male|Female|Other",
  age: "user_age",
  location: "user_location",
  country: "user_country",
  height: "user_height",
  weight: "user_weight",
  interestedin: ["interest_array"],
  isVip: false,
  vipStartDate: "vip_start_date",
  vipEndDate: "vip_end_date",
  active: true, // online status
  followers: ["follower_id_array"],
  following: ["following_id_array"],
  blockedUsers: ["blocked_user_id_array"],
  earnings: 0,
  balance: 0,
  createdAt: "account_creation_date",
  updatedAt: "last_update_date"
}

// Creator Portfolio:
{
  _id: "creator_portfolio_id",
  userid: "creator_user_id",
  name: "creator_name",
  age: "creator_age",
  location: "creator_location",
  hosttype: "Fan Call|Fan Meet|Fan Date",
  price: "service_price",
  duration: "service_duration",
  gender: "creator_gender",
  interestedin: ["interest_array"],
  photolink: ["photo_url_array"],
  views: ["viewer_id_array"],
  followers: ["follower_id_array"],
  earnings: 0,
  verify: "verification_status",
  isVip: false,
  vipEndDate: "vip_expiration_date",
  createdAt: "portfolio_creation_date"
}
```

#### 3. Creator Profiles (`/Profile/[userid]/`)

##### 1. Profile Information
- **Basic details**: Name, age, location, gender, height, weight
- **Service details**: Host type, pricing, duration, availability
- **Interests**: What the creator is interested in
- **Verification status**: Platform verification badges
- **VIP status**: VIP badge and expiration information

##### 2. Profile Features
- **Photo gallery**: Multiple profile pictures with navigation
- **VIP badge**: Special VIP status indicator
- **Portfolio details**: Comprehensive service information
- **View tracking**: Profile view count and analytics
- **Online status**: Real-time online/offline indicators

##### 3. Profile Actions
- **Edit profile**: Update profile information via backend API
- **Delete profile**: Remove creator profile with data cleanup
- **Privacy settings**: Control profile visibility and access
- **Block users**: Block unwanted users with privacy protection
- **Follow/Unfollow**: Social following functionality

#### 4. Fan Profiles
- **Basic information**: Name, location, preferences
- **Activity history**: Past interactions with creators
- **Gold balance**: Current gold balance and transaction history
- **Settings**: Privacy and notification preferences
- **Following list**: Creators the fan follows
- **Blocked users**: List of blocked users for privacy

#### 5. Profile Flow
1. **Profile view**: Frontend requests profile data from backend
2. **Data retrieval**: Backend fetches complete profile information
3. **View tracking**: Backend records profile view for analytics
4. **Real-time updates**: Socket.io provides live status updates
5. **Profile actions**: Updates sent to backend for processing

---

## Post Interactions

### Overview
Social media style interactions with posts including comments, likes, and sharing.

### Backend Post Controllers (`mmekoapi/Controller/Post/`)

#### 1. Post Controllers

##### `createpost.js`
- **Endpoint**: `POST /post`
- **Purpose**: Create new posts for creators
- **Features**:
  - Post content validation
  - Image/video upload handling
  - Creator authentication
  - Post visibility settings
  - Real-time post creation

##### `getpost.js`
- **Endpoint**: `GET /post`
- **Purpose**: Get posts for display
- **Features**:
  - Fetch posts with pagination
  - Creator information inclusion
  - Like and comment counts
  - Share tracking
  - Post filtering and sorting

##### `deletepost.js`
- **Endpoint**: `DELETE /post/:postId`
- **Purpose**: Delete posts
- **Features**:
  - Post deletion with authorization
  - Related data cleanup (likes, comments, shares)
  - Creator verification
  - Soft delete option

### Backend Like Controllers (`mmekoapi/Controller/Like/`)

#### 1. Like Controllers

##### `like.js`
- **Endpoint**: `POST /like`
- **Purpose**: Like/unlike posts
- **Features**:
  - Toggle like status
  - Like count updates
  - Duplicate like prevention
  - Real-time like notifications
  - Like analytics tracking

##### `getlikes.js`
- **Endpoint**: `GET /likes/:postId`
- **Purpose**: Get post likes
- **Features**:
  - Fetch all likes for a post
  - User information for likers
  - Like count and details
  - Pagination support

### Backend Comment Controllers (`mmekoapi/Controller/Comment/`)

#### 1. Comment Controllers

##### `createcomment.js`
- **Endpoint**: `POST /comment`
- **Purpose**: Create comments on posts
- **Features**:
  - Comment content validation
  - Post existence verification
  - Comment threading support
  - Real-time comment notifications
  - Comment moderation

##### `getcomments.js`
- **Endpoint**: `GET /comments/:postId`
- **Purpose**: Get post comments
- **Features**:
  - Fetch comments with pagination
  - Comment threading display
  - User information inclusion
  - Comment sorting (newest first)
  - Reply functionality

##### `deletecomment.js`
- **Endpoint**: `DELETE /comment/:commentId`
- **Purpose**: Delete comments
- **Features**:
  - Comment deletion with authorization
  - Creator or commenter verification
  - Nested comment handling
  - Comment count updates

### Backend Share Controllers (`mmekoapi/Controller/Share/`)

#### 1. Share Controllers

##### `share.js`
- **Endpoint**: `POST /share`
- **Purpose**: Share posts
- **Features**:
  - Post sharing functionality
  - Share count tracking
  - Share analytics
  - Real-time share notifications
  - Share history tracking

##### `getshares.js`
- **Endpoint**: `GET /shares/:postId`
- **Purpose**: Get post shares
- **Features**:
  - Fetch share information
  - Share count and details
  - User sharing information
  - Share analytics data

#### 2. Post Interaction Data Structure

```javascript
// Post:
{
  _id: "post_id",
  creatorId: "creator_user_id",
  content: "post_content",
  images: ["image_url_array"],
  videos: ["video_url_array"],
  likes: ["user_id_array"],
  comments: ["comment_id_array"],
  shares: ["share_id_array"],
  likeCount: 0,
  commentCount: 0,
  shareCount: 0,
  createdAt: "post_creation_date",
  updatedAt: "last_update_date",
  visibility: "public|private|followers"
}

// Like:
{
  _id: "like_id",
  postId: "post_id",
  userId: "user_id",
  createdAt: "like_timestamp"
}

// Comment:
{
  _id: "comment_id",
  postId: "post_id",
  userId: "user_id",
  content: "comment_content",
  parentCommentId: "parent_comment_id", // for replies
  replies: ["reply_comment_id_array"],
  createdAt: "comment_timestamp",
  updatedAt: "last_update_timestamp"
}

// Share:
{
  _id: "share_id",
  postId: "post_id",
  userId: "user_id",
  shareType: "direct|public",
  createdAt: "share_timestamp"
}
```

#### 3. Post Interaction Features (`/post/[postId]/`)

##### 1. Post Interactions
- **Like system**: Like/unlike posts with real-time counters
- **Comment system**: Add, edit, and delete comments
- **Share functionality**: Share posts with other users
- **Report system**: Report inappropriate posts

##### 2. Comment System
- **Nested comments**: Reply to specific comments
- **Comment moderation**: Edit and delete own comments
- **Comment notifications**: Get notified of new comments
- **Comment filtering**: Filter comments by various criteria

##### 3. Like System
- **Like tracking**: Track who liked your posts
- **Like notifications**: Get notified of new likes
- **Like analytics**: View like statistics for posts
- **Unlike functionality**: Remove likes from posts

#### 4. Post Interaction Flow
1. **User interaction**: User likes, comments, or shares a post
2. **Backend processing**: Backend validates and processes the interaction
3. **Database updates**: Interaction data is stored and counts updated
4. **Real-time notifications**: Creator receives instant notifications
5. **UI updates**: Frontend reflects new interaction counts immediately

---

## Gold System

### Overview
Virtual currency system for platform transactions and creator payments.

### Backend Gold Controllers (`mmekoapi/Controller/accountPayment/`)

#### 1. Gold Controllers

##### `goldpayment.js`
- **Endpoint**: `POST /goldpayment`
- **Purpose**: Process gold payments and transactions
- **Features**:
  - Gold balance validation
  - Payment processing and confirmation
  - Transaction logging and history
  - Real-time balance updates
  - Payment security and fraud prevention

##### `payment.conroller.js`
- **Endpoint**: `GET /paymenthistory`
- **Purpose**: Get payment and transaction history
- **Features**:
  - Complete transaction history
  - Payment method tracking
  - Gold balance history
  - Withdrawal request tracking
  - Payment analytics and reporting

### Backend VIP Controllers (`mmekoapi/Controller/VIP/`)

#### 1. VIP Controllers

##### `buyvip.js`
- **Endpoint**: `POST /buyvip`
- **Purpose**: Purchase VIP status with gold
- **Features**:
  - VIP subscription processing
  - Gold balance deduction
  - VIP status activation
  - Expiration date calculation
  - VIP benefits activation

##### `getvipstatus.js`
- **Endpoint**: `GET /vipstatus`
- **Purpose**: Get current VIP status
- **Features**:
  - VIP status verification
  - Expiration date checking
  - VIP benefits status
  - Renewal reminders

#### 2. Gold Data Structure

```javascript
// Gold Transaction:
{
  _id: "transaction_id",
  userId: "user_id",
  type: "payment|earning|withdrawal|vip_purchase",
  amount: "gold_amount",
  description: "transaction_description",
  status: "pending|completed|failed",
  paymentMethod: "gold_balance|external_payment",
  createdAt: "transaction_timestamp",
  completedAt: "completion_timestamp"
}

// VIP Subscription:
{
  _id: "vip_subscription_id",
  userId: "user_id",
  isVip: true,
  vipStartDate: "subscription_start_date",
  vipEndDate: "subscription_end_date",
  goldAmount: "gold_paid",
  status: "active|expired|cancelled",
  createdAt: "subscription_timestamp"
}

// Payment Account:
{
  _id: "payment_account_id",
  userId: "user_id",
  accountType: "bank_account|paypal|crypto_wallet",
  accountDetails: "encrypted_account_info",
  isActive: true,
  isVerified: false,
  createdAt: "account_creation_date"
}
```

#### 3. Gold Features (`/goldstat/`)

##### 1. Gold Usage
- **Creator payments**: Pay creators for services with gold balance
- **Platform fees**: Service charges and platform fees deducted from gold
- **VIP subscriptions**: Purchase VIP status with gold
- **Premium features**: Access premium platform features with gold

##### 2. Gold Statistics (`/goldstat/earnings/`)
- **Earnings tracking**: Track gold earnings over time with detailed analytics
- **Payment history**: Detailed payment records with filtering and search
- **Withdrawal requests**: Request gold to real money conversion
- **Analytics**: Gold usage and earning analytics with charts and reports

##### 3. Payment Accounts (`/goldstat/payment-account/`)
- **Payment methods**: Set up payment accounts for withdrawals
- **Wallet integration**: Connect crypto wallets
- **Bank accounts**: Link bank accounts for withdrawals
- **Payment verification**: Verify payment methods

---

## VIP System

### Overview
Premium membership system providing exclusive benefits and features.

### Backend VIP Controllers (`mmekoapi/Controller/VIP/`)

#### 1. VIP Controllers

##### `buyvip.js`
- **Endpoint**: `POST /buyvip`
- **Purpose**: Purchase VIP status with gold
- **Features**:
  - VIP subscription processing
  - Gold balance validation and deduction
  - VIP status activation
  - Expiration date calculation (30 days from purchase)
  - VIP benefits activation
  - Real-time VIP status updates

##### `getvipstatus.js`
- **Endpoint**: `GET /vipstatus`
- **Purpose**: Get current VIP status
- **Features**:
  - VIP status verification
  - Expiration date checking
  - VIP benefits status
  - Renewal reminders
  - VIP history tracking

##### `vipanalytics.js`
- **Endpoint**: `GET /vipanalytics`
- **Purpose**: Get VIP analytics and statistics
- **Features**:
  - VIP user statistics
  - VIP revenue tracking
  - VIP usage analytics
  - VIP renewal rates
  - VIP benefit utilization

#### 2. VIP Data Structure

```javascript
// VIP Subscription:
{
  _id: "vip_subscription_id",
  userId: "user_id",
  isVip: true,
  vipStartDate: "subscription_start_date",
  vipEndDate: "subscription_end_date",
  goldAmount: "gold_paid_for_vip",
  status: "active|expired|cancelled",
  benefits: {
    prioritySupport: true,
    enhancedVisibility: true,
    exclusiveFeatures: true,
    specialBadges: true
  },
  createdAt: "subscription_timestamp",
  updatedAt: "last_update_timestamp"
}

// VIP Benefits:
{
  prioritySupport: true,        // Faster customer support
  enhancedVisibility: true,     // Higher ranking in listings
  exclusiveFeatures: true,      // Access to premium features
  specialBadges: true,          // VIP status indicators
  priorityMessaging: true,      // Priority in messaging
  exclusiveContent: true,       // Access to exclusive content
  advancedAnalytics: true       // Enhanced analytics
}
```

#### 3. VIP Features

##### 1. VIP Benefits
- **Priority support**: Faster customer support response (24-hour response time)
- **Exclusive content**: Access to VIP-only content and features
- **Premium features**: Advanced platform features and tools
- **Special badges**: VIP status indicators throughout the platform
- **Enhanced visibility**: Higher ranking in creator listings and search results
- **Priority messaging**: Messages from VIP users get priority in creator inboxes
- **Advanced analytics**: Enhanced analytics and reporting tools

##### 2. VIP Management
- **VIP purchase**: Buy VIP status with gold (30-day subscription)
- **Auto-renewal**: Automatic VIP renewal before expiration
- **VIP expiration**: Track VIP expiration dates and send reminders
- **VIP analytics**: VIP user statistics and trends
- **VIP notifications**: Notify users of VIP status changes and benefits

##### 3. VIP Analytics (`/mmeko/admin/vip-analysis/`)
- **VIP statistics**: Total VIP users and growth tracking
- **Revenue tracking**: VIP-related earnings and revenue analytics
- **Renewal rates**: Auto-renewal vs manual renewal statistics
- **Monthly trends**: VIP user trends over time with detailed reports

#### 4. VIP Flow
1. **VIP purchase**: User purchases VIP status with gold
2. **Status activation**: Backend activates VIP status and benefits
3. **Benefits application**: VIP benefits are applied across the platform
4. **Expiration tracking**: System tracks VIP expiration date
5. **Renewal reminders**: Users receive reminders before expiration
6. **Status updates**: Real-time VIP status updates across the platform

---

## Admin Panel

### Overview
Comprehensive admin panel for platform management and user oversight.

### Backend Admin Controllers (`mmekoapi/Controller/Admin/`)

#### 1. Admin Controllers

##### `getalluser.js`
- **Endpoint**: `GET /admin/users`
- **Purpose**: Get all platform users for admin management
- **Features**:
  - Complete user list with pagination
  - User filtering and search functionality
  - User statistics and analytics
  - User activity tracking
  - Admin authorization verification

##### `deleteuser.js`
- **Endpoint**: `DELETE /admin/user/:userId`
- **Purpose**: Delete users from the platform
- **Features**:
  - User deletion with confirmation
  - Related data cleanup (posts, messages, etc.)
  - Admin authorization required
  - Data archiving for compliance
  - Deletion audit trail

##### `suspend_user.js`
- **Endpoint**: `PUT /admin/suspend/:userId`
- **Purpose**: Suspend or unsuspend users
- **Features**:
  - User suspension with reason tracking
  - Suspension duration management
  - User notification of suspension
  - Suspension history tracking
  - Admin authorization verification

##### `sendmessage.js`
- **Endpoint**: `POST /admin/sendmessage`
- **Purpose**: Send messages to users from admin
- **Features**:
  - Admin-to-user messaging
  - Message templates and customization
  - Bulk messaging capabilities
  - Message delivery tracking
  - Admin message history

##### `recivemessage.js`
- **Endpoint**: `GET /admin/messages`
- **Purpose**: Get messages sent to admin
- **Features**:
  - Admin inbox management
  - Message filtering and search
  - Message priority handling
  - Response tracking
  - Message analytics

##### `adminnotify.js`
- **Endpoint**: `POST /admin/notify`
- **Purpose**: Send notifications to users
- **Features**:
  - Platform-wide notifications
  - Targeted user notifications
  - Notification templates
  - Delivery tracking
  - Notification analytics

##### `deletenot.js`
- **Endpoint**: `DELETE /admin/notification/:notificationId`
- **Purpose**: Delete notifications
- **Features**:
  - Notification deletion
  - Bulk notification management
  - Notification cleanup
  - Admin authorization required

##### `vipAnalysis.js`
- **Endpoint**: `GET /admin/vip-analysis`
- **Purpose**: Get VIP analytics and statistics
- **Features**:
  - VIP user statistics
  - VIP revenue tracking
  - VIP renewal rates
  - VIP usage analytics
  - VIP trend analysis

#### 2. Admin Data Structure

```javascript
// Admin User:
{
  _id: "admin_id",
  username: "admin_username",
  email: "admin_email",
  role: "super_admin|admin|moderator",
  permissions: {
    userManagement: true,
    contentModeration: true,
    analytics: true,
    messaging: true,
    notifications: true
  },
  isActive: true,
  createdAt: "admin_creation_date",
  lastLogin: "last_login_timestamp"
}

// Admin Message:
{
  _id: "admin_message_id",
  fromAdmin: "admin_id",
  toUser: "user_id",
  subject: "message_subject",
  content: "message_content",
  messageType: "notification|warning|info",
  isRead: false,
  createdAt: "message_timestamp",
  readAt: "read_timestamp"
}

// User Suspension:
{
  _id: "suspension_id",
  userId: "user_id",
  suspendedBy: "admin_id",
  reason: "suspension_reason",
  duration: "suspension_duration",
  status: "active|expired|revoked",
  createdAt: "suspension_timestamp",
  expiresAt: "expiration_timestamp"
}
```

#### 3. Admin Features (`/mmeko/admin/`)

##### 1. User Management
- **User overview**: View all platform users with detailed information
- **User details**: Detailed user information and activity tracking
- **User suspension**: Suspend or ban users with reason tracking
- **User analytics**: User statistics and growth trends
- **User search**: Advanced user search and filtering
- **Bulk actions**: Perform bulk operations on multiple users

##### 2. Withdrawal Management (`/mmeko/admin/withdrawal/`)
- **Withdrawal requests**: Review and approve withdrawal requests
- **Payment processing**: Process payments to users
- **Withdrawal history**: Track all withdrawal transactions
- **Color-coded system**: Visual organization of withdrawal requests

##### 3. Support Management
- **Support chat**: Handle user support requests
- **Category filtering**: Filter support by category
- **Priority handling**: VIP user priority support
- **Response management**: Manage support responses

##### 4. Analytics Dashboard
- **Platform statistics**: Overall platform metrics
- **Revenue tracking**: Financial performance
- **User engagement**: User activity metrics
- **VIP analysis**: VIP system performance

#### 4. Admin Flow
1. **Admin login**: Admin authenticates with elevated privileges
2. **Dashboard access**: Admin accesses comprehensive dashboard
3. **User management**: Admin manages users, content, and platform
4. **Analytics review**: Admin reviews platform analytics and trends
5. **Action execution**: Admin performs management actions
6. **Audit logging**: All admin actions are logged for compliance

---

## Technical Architecture

### Frontend
- **Next.js**: React framework with SSR/SSG
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Redux Toolkit**: State management
- **Socket.io**: Real-time communication

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **MongoDB**: Database
- **Socket.io**: Real-time communication
- **JWT**: Authentication

### Key Features
- **Real-time updates**: Socket.io integration
- **Responsive design**: Mobile-first approach
- **Authentication**: JWT-based auth system
- **File uploads**: Image and document handling
- **Payment integration**: Gold and real money transactions

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
API_URL=your_api_url
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## License

[Your License Here]

---

## Support

For support, email support@mmeko.com or use the in-app support chat system.