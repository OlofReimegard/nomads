import Axios from 'axios';

export function recieveFriendRequests() {

    return Axios.get("/friends-page-requests").then(({data}) => {
        return {
            type: 'RECIEVE_FRIEND_REQUESTS',
            friends: data.friends,
            requests: data.requests
        };
    });
}

export function acceptFriendRequest(rec_id) {
    return Axios.post("/request", {status:1, recId: rec_id}).then(({data}) => {
        return {
            type: 'ACCEPT_FRIEND_REQUEST',
            id:rec_id
        };
    });
}

export function endFriendship(rec_id) {
    return Axios.post("/request", {status:5, recId: rec_id}).then(({data}) => {
        return {
            type: 'END_FRIENDSHIP',
            id:rec_id
        };
    });
}


export function showOnlineUsers(onlineIds,onlineMessages) {


    return Axios.post("/add-user", {onlineIds}).then(({data}) => {

        const userId = data.yourId;


        let filteredUsers = data.onlineUsers[0];

        let ultraFilteredUsers = filteredUsers.filter((obj) => {


            if(data.yourId != obj.userId && typeof obj.socketId != undefined){
                return obj.userId;
            }
        });
        const superDuperUsers = [];

        ultraFilteredUsers.forEach((user) => {
            superDuperUsers.push(user.userId);

        });


        const finalUsers = [];

        superDuperUsers.forEach((number) => {
            if (finalUsers.indexOf(number) < 0) {
                finalUsers.push(number);
            }
        });
        let onlineUsers = 0;

        return Axios.post("/online-users", {finalUsers}).then(({data}) => {

            onlineUsers = data;
            return {
                type: 'GET_ONLINE_USERS',
                onlineUsers: onlineUsers,
                yourId: userId,
                onlineMessages: onlineMessages


            };
        });

    });

}

export function removeOnlineUser(userId) {

    return {
        type: 'REMOVE_ONLINE_USER',
        userId: userId
    };

}

export function addOnlineUser(userId,onlineMessages) {

    return Axios.post("/user-info", {userId:userId}).then(({data}) => {
        return {
            type: 'ADD_ONLINE_USER',
            userInfo: data,
            onlineMessages: onlineMessages,
            YourId:userId

        };
    });

}

export function newMsg(messageArr) {

    return {
        type: 'NEW_MESSAGE',
        onlineMessages: messageArr
    };


}
