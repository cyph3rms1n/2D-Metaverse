const axios = require("axios");

const BACKEND_URL = "http://localhost:3000"
const WS_URL = "ws://localhost:3001"

describe("Authentication", () =>{
    test('User is able to sign up only once', async() => {
        const username = "sam" + Math.random();
        const password = "123456789";

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })
        expect(response.statusCode).toBe(200);

        const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        })
        expect(updatedResponse.statusCode).toBe(400);
    });

    test('Signup request fails if usename is empty', async() =>{
        const username = `sam-${Math.random()}` // sam-0.12323
        const password = "123454545"

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password
        })
        expect(response.statusCode).toBe(400);
    })

    test('Signup succeed if the username and password are correct', async() =>{
        const username = `sam-${Math.random()}` // sam-0.3244322
        const password = "12323432"

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password
        })

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })
        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
    })

    test('Signin fails if the username and password are incorrect', async() =>{
        const username = `sam-${Math.random()}`
        const password = "1232343"

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: "wrong username",
            password
        });
        expect(response.statusCode).toBe(403);

    })
});

describe("User Information endpoints", () =>{
    let token = "";
    let avatarId = "";

    beforeAll( async () =>{
        const username = `sam-${Math.random()}`
        const password = "1234222"

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        });

        token = response.data.token

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl":"https://slm-assets.secondlife.com/assets/11198038/lightbox/Snapshot_002.jpg?1425549351",
            "name": "Krom"
        }, {
            headers: {
                "authorization" : `Bearer ${userToken}`
            }
        })
        avatarId = avatarResponse.data.avatarId;
    });

    test("User can't update their metadata with a wrong avatar id", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "12322123"
        }, {
            headers: {
                "authorization": `Bearer ${token}`
            }
        })

        expect(response.statusCode).toBe(400);
    });

    test("User can update their metadata with righ avatar id", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        }, {
            headers: {
                "authorization": `Bearer ${token}`
            }
        })

        expect(response.statusCode).toBe(200);
    });

    test('User cannot update their metadata is the auth header is not present', async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        })

        expect(response.statusCode).toBe(403);
    })

});

describe("User avatar information", () => {
    let avatarId;
    let token;
    let userId;
    beforeAll( async () =>{
        const username = `sam-${Math.random()}`
        const password = "1234222"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        });

        userId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        });

        token = response.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl":"https://slm-assets.secondlife.com/assets/11198038/lightbox/Snapshot_002.jpg?1425549351",
            "name": "Krom"
        }, {
            headers : {
                "authorization" : `Bearer ${adminToken}`
            }
        })
        avatarId = avatarResponse.data.avatarId;
    });

    test("Get back avatar information for user", async() =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);

        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userId).toBe(userId);
    })

    test("Available avatars lists the recently created avatar", async() =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);

        expect(response.data.avatars.length).not.toBe(0);

        const currentAvatar = response.data.avatars.find(x => x.id == avatarId);
        expect(currentAvatar).toBeDefined();
    })
});

describe("Space Information", () =>{
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let userToken;
    let userId;

    beforeAll(async() =>{
        const username = `sam-${Math.random()}`
        const password = "1234222"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        });

        adminId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        });

        adminToken = response.data.token;

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username : username + "-user",
            password,
            type:"user"
        });

        userId = userSignupResponse.data.userId;

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username : username + "-user",
            password
        });

        userToken = userSigninResponse.data.token;

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl":"https://thumbs.dreamstime.com/z/national-park-visitors-flat-color-vector-illustration-people-enjoying-summertime-recreation-activities-kids-playground-d-185726847.jpg?ct=jpeg",
            "width": 1,
            "height":1,
            "stattic":true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl":"https://thumbs.dreamstime.com/z/national-park-visitors-flat-color-vector-illustration-people-enjoying-summertime-recreation-activities-kids-playground-d-185726847.jpg?ct=jpeg",
            "width": 1,
            "height":1,
            "stattic":true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        element1Id = element1Response.data.id;
        element2Id = element2Response.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "defaultElements": [{
                elementId: element1Id,
                x: 20,
                y:20
            }, {
                elementId: element1Id,
                x: 18,
                y: 20
            }, {
                elementId: element2Id,
                x:19,
                y:20
            }]
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        })
        mapId = mapResponse.id;

    });

    test("User is able to create a space ", async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimension": "100x200",
            "mapId":mapId
        }, {
            header: {
                authorization: `Bearer ${userToken}`
            }
        })

        expect(response.data.spaceId).toBeDefined();
    });

    test("User is able to create a space without mapId(empty space)", async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimension": "100x200",
        }, {
            header: {
                authorization: `Bearer ${userToken}`
            }
        })

        expect(response.data.spaceId).toBeDefined();
    });

    test("User is not able to create a space without mapId and dimension", async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

        expect(response.statusCode).toBe(400);
    });

    test("User is not able to delete a space which does't exist ", async() =>{
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesnotExist`, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })
        expect(response.statusCode).toBeDefined(400);
    });

    test("User is  able to delete a space which does exist ", async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimension": "100x200",
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space${response.data.spaceId}`, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

        expect(deleteResponse.statusCode).toBeDefined(200);
    });

    test("User should not be able to delete space created by some other user", async() =>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimension": "100x200",
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space${response.data.spaceId}`, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        })

        expect(deleteResponse.statusCode).toBeDefined(400);
    });
    
    test("Admin has no spaces initially", async () =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                authorization : `Beared ${userToken}`
            }
        });
        expect(response.data.spaces.length).toBe(0);
    });

    test("Admin created space initially", async () =>{
        const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space/`,{
            "name": "Test",
            "dimensions": "100x200"
        }, {
            headers: {
                authorization : `Bearer ${userToken}`
            }
        });
        const response  = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                authorization : `Bearer ${userToken}`
            }
        });
        const filterSpace = response.data.spaces.find(x => x.id == spaceCreateResponse.spaceId);
        expect(response.data.spaces.length).toBe(1);
        expect(filterSpace).toBeDefined();
    });

});

describe("Arena Endpoints", () =>{
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let userToken;
    let userId;
    let spaceId;

    beforeAll(async() =>{
        const username = `sam-${Math.random()}`
        const password = "1234222"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        });

        adminId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        });

        adminToken = response.data.token;

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username : username + "-user",
            password,
            type:"user"
        });

        userId = userSignupResponse.data.userId;

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username : username + "-user",
            password
        });

        userToken = userSigninResponse.data.token;

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl":"https://thumbs.dreamstime.com/z/national-park-visitors-flat-color-vector-illustration-people-enjoying-summertime-recreation-activities-kids-playground-d-185726847.jpg?ct=jpeg",
            "width": 1,
            "height":1,
            "stattic":true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl":"https://thumbs.dreamstime.com/z/national-park-visitors-flat-color-vector-illustration-people-enjoying-summertime-recreation-activities-kids-playground-d-185726847.jpg?ct=jpeg",
            "width": 1,
            "height":1,
            "stattic":true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        element1Id = element1Response.data.id;
        element2Id = element2Response.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "defaultElements": [{
                elementId: element1Id,
                x: 20,
                y:20
            }, {
                elementId: element1Id,
                x: 18,
                y: 20
            }, {
                elementId: element2Id,
                x:19,
                y:20
            }]
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });
        mapId = mapResponse.id;

        const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/`, {
            "name": "Test",
            "dimensions": "100x200",
            "mapId":mapId
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });
        spaceId = spaceResponse.data.spaceId;
    });

    test("Incorrect spaceId returns 400", async () =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/123kasdk01`, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });
        expect(response.statusCode).toBe(400);
    });

    test("Correct spaceId retruns all the elements", async () =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });
        expect(response.data.dimensions).toBe("100x200");
        expect(response.data.elements.length).toBe(3);
    });

    test("Delete endPoint is able to delete and element", async () =>{
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });

        await axios.delete(`${BACKEND_URL}/api/v1/space/elemet`, {
            spaceId: spaceId,
            elementId: response.data.elements[0].id
        }, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });
        expect(newResponse.data.elements.length).toBe(2)
    });

    test("Adding an element fails if the elemets lies outside the dimensions", async () =>{
        const response =  await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId": element1Id,
            "spaceId": spaceId,
            "x": 50000,
            "y": 10000
        }, {
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        })
        expect(response.statusCode).toBe(400);
    });

    test("Adding an element works as expected", async () =>{
        await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId": element1Id,
            "spaceId": spaceId,
            "x": 50,
            "y": 10
        }, {
            header: {
                "authorization": `Bearer ${userToken}`
            }
        });

        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers: {
                "authorization": `Bearer ${userToken}`
            }
        });
        expect(response.data.elements.length).toBe(3);
    });
});

describe("Admin EndPoints", () =>{
    let adminToken;
    let adminId;
    let userToken;
    let userId;

    beforeAll(async() =>{
        const username = `sam-${Math.random()}`
        const password = "1234222"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type:"admin"
        });

        adminId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        });

        adminToken = response.data.token;

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username : username + "-user",
            password,
            type:"user"
        });

        userId = userSignupResponse.data.userId;

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username : username + "-user",
            password
        });

        userToken = userSigninResponse.data.token;
    });

    test("User is not able to hit admin EndPoints", async () => {
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl":"https://thumbs.dreamstime.com/z/national-park-visitors-flat-color-vector-illustration-people-enjoying-summertime-recreation-activities-kids-playground-d-185726847.jpg?ct=jpeg",
            "width": 1,
            "height":1,
            "stattic":true
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "defaultElements": []
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl":"https://slm-assets.secondlife.com/assets/11198038/lightbox/Snapshot_002.jpg?1425549351",
            "name": "Krom"
        }, {
            headers: {
                "authorization" : `Bearer ${userToken}`
            }
        });

        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/123`, {
            "imageUrl": "https://slm-assets.secondlife.com/assets/11198038/lightbox/Snapshot_002.jpg?1425549351"
        }, {
            headers: {
                "authorization" : `Bearer ${userToken}`
            }
        });
    
        expect(elementResponse.statusCode).toBe(403);
        expect(mapResponse.statusCode).toBe(403);    
        expect(avatarResponse.statusCode).toBe(403);
        expect(updateElementResponse.statusCode).toBe(403);
    });

    test("Admin is able to hit admin EndPoints", async () => {
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl":"https://thumbs.dreamstime.com/z/national-park-visitors-flat-color-vector-illustration-people-enjoying-summertime-recreation-activities-kids-playground-d-185726847.jpg?ct=jpeg",
            "width": 1,
            "height":1,
            "stattic":true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "defaultElements": []
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl":"https://slm-assets.secondlife.com/assets/11198038/lightbox/Snapshot_002.jpg?1425549351",
            "name": "Krom"
        }, {
            headers: {
                "authorization" : `Bearer ${adminToken}`
            }
        });

    
        expect(elementResponse.statusCode).toBe(200);
        expect(mapResponse.statusCode).toBe(200);    
        expect(avatarResponse.statusCode).toBe(200);
    });

    test("Admin is able to update the imageUrl for an element", async () => {
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl":"https://thumbs.dreamstime.com/z/national-park-visitors-flat-color-vector-illustration-people-enjoying-summertime-recreation-activities-kids-playground-d-185726847.jpg?ct=jpeg",
            "width": 1,
            "height":1,
            "stattic":true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        const updateelemetResponse = await axios.put(`${BACKEND_URL}/api/v1/element/${elementResponse.data.id}`, {
            "imageUrl":"https://imgs.search.brave.com/Sik3yzfMFbD8WWGaR7xN3cHBT-porolY_xVCsR5mp5M/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/cGl4YWJheS5jb20v/cGhvdG8vMjAyMi8w/OS8wNC8yMi8wNS9n/aXJsLTc0MzI4NTVf/NjQwLmpwZw",
        }, {
            headers: {
                "authorization": `Bearer ${adminToken}`
            }
        });

        eaxpect(updateelemetResponse.statusCode).toBe(200);
    })


});

describe("Websocket tests", () => {
    let adminToken;
    let adminUserId;
    let userToken;
    let userId;
    let mapId;
    let element1Id;
    let element2Id;
    let spaceId;
    let ws1;
    let ws2;
    let ws1Message = [];
    let ws2Message = [];
    let userX;
    let userY;
    let adminX;
    let adminY;

    function waitForAndPopLatestMessage(messageArray) {
        return new Promise(r => {
            if(messageArray.length > 0){
                resolve(messageArray.shift())
            } else {
                let interval = setInterval(() => {
                    if(messageArray.length > 0){
                        resolve(messageArray.shift())
                        clearInterval(interval)
                    }
                }, 100)
            }
        })
    }

    async function setupHTTP() {
         const username = `sam-${Math.random()}`;
        const password = "123456";

        const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            role: "Admin"
        });

        const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        });

        adminUserId = adminSignupResponse.data.userId;
        adminToken = adminSigninResponse.data.token;

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + `-user`,
            password
        });

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + `-user`,
            password
        });

        userId = userSignupResponse.data.userId;
        userToken = userSigninResponse.data.token;

         const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl":"https://thumbs.dreamstime.com/z/national-park-visitors-flat-color-vector-illustration-people-enjoying-summertime-recreation-activities-kids-playground-d-185726847.jpg?ct=jpeg",
            "width": 1,
            "height":1,
            "stattic":true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl":"https://thumbs.dreamstime.com/z/national-park-visitors-flat-color-vector-illustration-people-enjoying-summertime-recreation-activities-kids-playground-d-185726847.jpg?ct=jpeg",
            "width": 1,
            "height":1,
            "stattic":true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        element1Id = element1Response.data.id;
        element2Id = element2Response.data.id;

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "defaultElements": [{
                elementId: element1Id,
                x: 20,
                y:20
            }, {
                elementId: element1Id,
                x: 18,
                y: 20
            }, {
                elementId: element2Id,
                x:19,
                y:20
            }]
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });
        mapId = mapResponse.id;

        const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/`, {
            "name": "Test",
            "dimensions": "100x200",
            "mapId":mapId
        }, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        });
        spaceId = spaceResponse.data.spaceId;
    }

    async function setupWs() {
        ws1 = new WebSocket(WS_URL);

        await new Promise(r => {
            ws1.onopen = r
        });

        ws1.onmessage = (event) => {
            ws1Message.push(JSON.parse(event.data))
        }

        
        ws2 = new WebSocket(WS_URL);

        await new Promise(r => {
            ws2.onopen = r
        });

        ws2.onmessage = (event) => {
            ws2Message.push(JSON.parse(event.data))
        }
    }

    beforeAll(async () => {
       setupHTTP();
       setupWs();
    });

    test("Get back acknowledegment when joining the space", async () => {
        ws1.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": adminToken
            }
        }));
        const message1 = await waitForAndPopLatestMessage(ws1Message);

        ws2.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": userToken
            }
        }))

        const message2 = await waitForAndPopLatestMessage(ws2Message);
        const message3 = await waitForAndPopLatestMessage(ws1Message);

        expect(message1.type).toBe("space-joined");
        expect(message2.type).toBe("space-joined");


        expect(message1.payload.users.length).toBe(0);
        expect(message2.payload.users.length).toBe(1);
        expect(message3.type).toBe("User-joined");

        expect(message3.payload.x).toBe(message2.payload.spawn.x);
        expect(message3.payload.y).toBe(message2.payload.spawn.y);
        expect(message3.payload.userId).toBe(userId);


        adminX = message1.payload.spawn.x;
        adminY = message1.payload.spawn.y;

        userX = message2.payload.spawn.x;
        userY = message2.payload.spawn.y;
    });

    test("User should not be able to move across the boundary of the wall", async () => {
        ws1.send(JSON.stringify({
            type: "movement",
            payload: {
                x: 10000000,
                y: 100000000
            }
        }));

        const message = await waitForAndPopLatestMessage(ws1Message);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY);
    });

    test("User should not be able to move two block at the same time", async () => {
        ws1.send(JSON.stringify({
            type: "movement",
            payload: {
                x: adminX + 2,
                y: adminY
            }
        }));

        const message = await waitForAndPopLatestMessage(ws1Message);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY);
    });

    test("Correct move should be broadcasted to the other sockets in the room", async () => {
        ws1.send(JSON.stringify({
            type: "movement",
            payload: {
                x: adminX + 1,
                y: adminY
            }
        }));

        const message = await waitForAndPopLatestMessage(ws1Message);
        expect(message.type).toBe("movement");
        expect(message.payload.x).toBe(adminX + 1);
        expect(message.payload.y).toBe(adminY);
    });

    test("If a user leaves, the other user receives a leave event", async () => {
        ws2.close();
        const message = await waitForAndPopLatestMessage(ws1Message);
        expect(message.type).toBe("User-left");
        expect(message.payload.userId).toBe(adminUserId);
    });
});

