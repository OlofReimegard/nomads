export default function(state = {}, action) {
    if (action.type == 'RECIEVE_FRIEND_REQUESTS') {

        state = Object.assign({}, state, {
            friends: action.friends,
            requests: action.requests
        });

    }
    if (action.type == 'ACCEPT_FRIEND_REQUEST') {
        const newFriends = state.friends;
        newFriends.push(state.requests.filter((friend) => {
            return friend.id == action.id;
        })[0]);

        const newRequests = state.requests.filter((object) => {
            return object.id != action.id;
        });

        state = Object.assign({}, state, {
            friends: newFriends,
            requests: newRequests
        });

    }
    if (action.type == 'END_FRIENDSHIP') {

        const newFriends = state.friends.filter((object) => {
            return object.id != action.id;
        });

        state = Object.assign({}, state, {friends: newFriends});

    }
    if (action.type == 'GET_ONLINE_USERS') {

        state = Object.assign({}, state, {
            online: action.onlineUsers,
            userId: action.yourId,
            chatMessages: action.onlineMessages
        });

    }

    if (action.type == 'REMOVE_ONLINE_USER') {

        const newOnlineUsers = state.online.filter((user) => {
            return user.id != action.userId;
        });

        state = Object.assign({}, state, {online: newOnlineUsers});

    }

    if (action.type == 'ADD_ONLINE_USER') {

        let newUsers = [];
        state.online && state.online.forEach((user) => {
            newUsers.unshift(user);
        });
        if (action.userInfo[0].id != state.userId) {
            newUsers.push(action.userInfo[0]);

        }
        state = Object.assign({}, state, {
            online: newUsers,
            chatMessages: action.onlineMessages,
            yourId: action.YourId
        });

    }

    if (action.type == 'NEW_MESSAGE') {

        state = Object.assign({}, state, {chatMessages: action.onlineMessages});
    }
    return state;
}
