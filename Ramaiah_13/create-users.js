const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

console.log('Starting script to create users.json...');

// Define your users here WITH THEIR PLAIN TEXT PASSWORDS
const usersToCreate = [
  {
    "id": 1,
    "username": "Prabhu",
    "password": "Prabhu@123",
    "role": "user"
  },
  {
    "id": 2,
    "username": "AMBA",
    "password": "Amba@123",
    "role": "admin"
  },
  {
    "id": 3,
    "username": "Neha",
    "password": "Neha@123",
    "role": "user"
  },
  {
    "id": 4,
    "username": "pavan@kalyani.com",
    "password": "pavan@123",
    "role": "user"
  },
  {
    "id": 5,
    "username": "sudhishna@kalyani.com",
    "password": "sudhishna@123",
    "role": "user"
  },
  {
    "id": 6,
    "username": "dhanush@ashayam.com",
    "password": "dhanush@123",
    "role": "user"
  },
  {
    "id": 7,
    "username": "satyanaryana@ashayam.com",
    "password": "satyanaryana@123",
    "role": "user"
  },
  {
    "id": 8,
    "username": "nikhil@saiprema.com",
    "password": "nikhil@123",
    "role": "user"
  },
  {
    "id": 9,
    "username": "chetan@saiprema.com",
    "password": "chetan@123",
    "role": "user"
  },
  {
    "id": 10,
    "username": "prany@abhayajyothi.com",
    "password": "prany@123",
    "role": "user"
  },
  {
    "id": 11,
    "username": "likita@abhayajyothi.com",
    "password": "likita@123",
    "role": "user"
  },
  {
    "id": 12,
    "username": "anish@manasa.com",
    "password": "anish@123",
    "role": "user"
  },
  {
    "id": 13,
    "username": "manish@manasa.com",
    "password": "manish@123",
    "role": "user"
  },
  {
    "id": 14,
    "username": "sagar@samarthanam.com",
    "password": "sagar@123",
    "role": "user"
  },
  {
    "id": 15,
    "username": "shivaprasad@samarthanam.com",
    "password": "shivaprasad@123",
    "role": "user"
  },
  {
    "id": 16,
    "username": "jaikumar@papcp.com",
    "password": "jaikumar@123",
    "role": "user"
  },
  {
    "id": 17,
    "username": "samrat@papcp.com",
    "password": "samrat@123",
    "role": "user"
  },
  {
    "id": 18,
    "username": "kanta@antharganga.com",
    "password": "kanta@123",
    "role": "user"
  },
  {
    "id": 19,
    "username": "mala@antharganga.com",
    "password": "mala@123",
    "role": "user"
  },
  {
    "id": 20,
    "username": "lakshmikanta@manasat.com",
    "password": "lakshmikanta@123",
    "role": "user"
  },
  {
    "id": 21,
    "username": "abreen@manasat.com",
    "password": "abreen@123",
    "role": "user"
  },
  {
    "id": 22,
    "username": "mahesh@krishna.com",
    "password": "mahesh@123",
    "role": "user"
  },
  {
    "id": 23,
    "username": "girinandan@krishna.com",
    "password": "girinandan@123",
    "role": "user"
  },
  {
    "id": 24,
    "username": "dhanasurya@amrit.com",
    "password": "dhanasurya@123",
    "role": "user"
  },
  {
    "id": 25,
    "username": "rajaprakash@amrit.com",
    "password": "rajaprakash@123",
    "role": "user"
  },
  {
    "id": 26,
    "username": "selvakumar@ritham.com",
    "password": "selvakumar@123",
    "role": "user"
  },
  {
    "id": 27,
    "username": "gurunithish@ritham.com",
    "password": "gurunithish@123",
    "role": "user"
  },
  {
    "id": 28,
    "username": "kavitha@gv.com",
    "password": "kavitha@123",
    "role": "user"
  },
  {
    "id": 29,
    "username": "hemamanjuri@gv.com",
    "password": "hemamanjuri@123",
    "role": "user"
  },
  {
    "id": 30,
    "username": "selin@anne.com",
    "password": "selin@123",
    "role": "user"
  },
  {
    "id": 31,
    "username": "pirakathi@anne.com",
    "password": "pirakathi@123",
    "role": "user"
  },
  {
    "id": 32,
    "username": "vasanthkumar@faith.com",
    "password": "vasanthkumar@123",
    "role": "user"
  },
  {
    "id": 33,
    "username": "prithiviraju@faith.com",
    "password": "prithiviraju@123",
    "role": "user"
  },
  {
    "id": 34,
    "username": "anasn@adarsh.com",
    "password": "anasn@123",
    "role": "user"
  },
  {
    "id": 35,
    "username": "bavadharani@adarsh.com",
    "password": "bavadharani@123",
    "role": "user"
  },
  {
    "id": 36,
    "username": "sakthivel@amar.com",
    "password": "sakthivel@123",
    "role": "user"
  },
  {
    "id": 37,
    "username": "anitha@amar.com",
    "password": "anitha@123",
    "role": "user"
  },
  {
    "id": 38,
    "username": "amit@snehalaya.com",
    "password": "amit@123",
    "role": "user"
  },
  {
    "id": 39,
    "username": "drumil@snehalaya.com",
    "password": "drumil@123",
    "role": "user"
  },
  {
    "id": 40,
    "username": "sayali@sanskar.com",
    "password": "sayali@123",
    "role": "user"
  },
  {
    "id": 41,
    "username": "avanti@sanskar.com",
    "password": "avanti@123",
    "role": "user"
  },
  {
    "id": 42,
    "username": "dhruvi@kalrav.com",
    "password": "dhruvi@123",
    "role": "user"
  },
  {
    "id": 43,
    "username": "anshibhavsar@kalrav.com",
    "password": "anshibhavsar@123",
    "role": "user"
  },
  {
    "id": 44,
    "username": "hardikjoshi@kalrav.com",
    "password": "hardikjoshi@123",
    "role": "user"
  },
  {
    "id": 45,
    "username": "jaseel@vkm.com",
    "password": "jaseel@123",
    "role": "user"
  },
  {
    "id": 46,
    "username": "arjun@vkm.com",
    "password": "arjun@123",
    "role": "user"
  },
  {
    "id": 47,
    "username": "arjunnair@asadeepam.com",
    "password": "arjunnair@123",
    "role": "user"
  },
  {
    "id": 48,
    "username": "ahemmedyasin@asadeepam.com",
    "password": "ahemmedyasin@123",
    "role": "user"
  },
  {
    "id": 49,
    "username": "thushar@navajyothi.com",
    "password": "thushar@123",
    "role": "user"
  },
  {
    "id": 50,
    "username": "sathi@navajyothi.com",
    "password": "sathi@123",
    "role": "user"
  },
  {
    "id": 51,
    "username": "paulantony@snehasadan.com",
    "password": "paulantony@123",
    "role": "user"
  },
  {
    "id": 52,
    "username": "antonywilson@snehasadan.com",
    "password": "antonywilson@123",
    "role": "user"
  },
  {
    "id": 53,
    "username": "sumesh@stthomas.com",
    "password": "sumesh@123",
    "role": "user"
  },
  {
    "id": 54,
    "username": "anju@stthomas.com",
    "password": "anju@123",
    "role": "user"
  },
  {
    "id": 55,
    "username": "pavithra@bethashan.com",
    "password": "pavithra@123",
    "role": "user"
  },
  {
    "id": 56,
    "username": "abdulnazar@bethashan.com",
    "password": "abdulnazar@123",
    "role": "user"
  },
  {
    "id": 57,
    "username": "deepak@kaumaram.com",
    "password": "deepak@123",
    "role": "user"
  },
  {
    "id": 58,
    "username": "kishore@kaumaram.com",
    "password": "kishore@123",
    "role": "user"
  },
  {
    "id": 59,
    "username": "dhanushkumar@anbalaya.com",
    "password": "dhanushkumar@123",
    "role": "user"
  },
  {
    "id": 60,
    "username": "bennyisaac@anbalaya.com",
    "password": "bennyisaac@123",
    "role": "user"
  },
  {
    "id": 61,
    "username": "rajath@amba.com",
    "password": "rajath@123",
    "role": "user"
  },
  {
    "id": 62,
    "username": "rakshith@amba.com",
    "password": "rakshith@123",
    "role": "user"
  },
  {
    "id": 63,
    "username": "sandeep@amba.com",
    "password": "sandeep@123",
    "role": "user"
  },
  {
    "id": 64,
    "username": "tejas@amba.com",
    "password": "tejas@123",
    "role": "user"
  },
  {
    "id": 65,
    "username": "anandhi@amba.com",
    "password": "anandhi@123",
    "role": "user"
  },
  {
    "id": 66,
    "username": "chandini@amba.com",
    "password": "chandini@123",
    "role": "user"
  },
  {
    "id": 67,
    "username": "suhas@amba.com",
    "password": "suhas@123",
    "role": "user"
  },
  {
    "id": 68,
    "username": "shreyas@amba.com",
    "password": "shreyas@123",
    "role":"User"
  },  
  {
    "id": 69,
    "username": "ranjith@amba.com",
    "password": "ranjith@123",
    "role":"User"
  },
  {
    "id": 70,
    "username": "sumedh@amba.com",
    "password": "sumedh@123",
    "role":"User"
  },
  {
    "id": 71,
    "username": "kiren@amba.com",
    "password": "kiren@123",
    "role":"User"
  },
  {
    "id": 72,
    "username": "ram@amba.com",
    "password": "ram@123",
    "role":"User"
  },
  {
    "id": 73,
    "username": "shruthi@amba.com",
    "password": "shruthi@123",
    "role":"User"
  },
  {
    "id": 74,
    "username": "krishna@amba.com",
    "password": "krishna@123",
    "role":"User"
  }, 
  {
    "id": 75,
    "username": "nikhil@amba.com",
    "password": "nikhil@123",
    "role":"User"
  },
  {
    "id": 76,
    "username": "manasa@amba.com",
    "password": "manasa@123",
    "role":"User"
  },
  {
    "id": 77,
    "username": "sanjay@amba.com",
    "password": "sanjay@123",
    "role":"User"
  }, 
  {
    "id": 78,
    "username": "arshith@amba.com",
    "password": "arshith@123",
    "role":"User"
  },
  {
    "id": 79,
    "username": "preethi@amba.com",
    "password": "preethi@123",
    "role":"User"
  },
  {
    "id": 80,
    "username": "cegeo@amba.com",
    "password": "cegeo@123",
    "role":"User"
  },
  {
    "id": 81,
    "username": "simi@amba.com",
    "password": "simi@123",
    "role":"User"
  },
  {
    "id": 82,
    "username": "krupanidhi@amba.com",
    "password": "krupanidhi@123",
    "role":"User"
  },
  {
    "id": 83,
    "username": "nachiket@amba.com",
    "password": "nachiket@123",
    "role":"User"
  },
  {
    "id": 84,
    "username": "shashank@amba.com",
    "password": "shashank@123",
    "role":"User"
  },
  {
    "id": 85,
    "username": "akshatha@amba.com",
    "password": "akshatha@123",
    "role":"User"
  },
  {
    "id": 86,
    "username": "rohit@amba.com",
    "password": "rohit@123",
    "role":"User"
  },
  {
    "id": 87,
    "username": "ravi@amba.com",
    "password": "ravi@123",
    "role":"User"
  },
  {
    "id": 88,
    "username": "musaib@amba.com",
    "password": "musaib@123",
    "role":"User"
  },
  {
    "id": 89,
    "username": "anilck@amba.com",
    "password": "anilck@123",
    "role":"User"
  },
  {
    "id": 90,
    "username": "kavya@amba.com",
    "password": "kavya@123",
    "role":"User"
  },
  {
    "id": 91,
    "username": "haripriya@amba.com",
    "password": "haripriya@123",
    "role":"User"
  },
  {
    "id": 92,
    "username": "kamlesh@amba.com",
    "password": "kamlesh@123",
    "role":"User"
  },
  {
    "id": 93,
    "username": "monica@amba.com",
    "password": "monica@123",
    "role":"User"
  },
  {
    "id": 94,
    "username": "arvind@amba.com",
    "password": "arvind@123",
    "role":"User"
  },
  {
    "id": 95,
    "username": "shreyasg@amba.com",
    "password": "shreyasg@123",
    "role":"User"
  },
  {
    "id": 96,
    "username": "bhaskar@amba.com",
    "password": "bhaskar@123",
    "role":"User"
  },
  {
    "id": 97,
    "username": "stephen@amba.com",
    "password": "stephen@123",
    "role":"User"
  },
  {
    "id": 98,
    "username": "anjan@amba.com",
    "password": "anjan@123",
    "role":"User"
  },
  {
    "id": 99,
    "username": "abdul@amba.com",
    "password": "abdul@123",
    "role":"User"
  },
  {
    "id": 100,
    "username": "ajaym@amba.com",
    "password": "ajaym@123",
    "role":"User"
  },
  {
    "id": 101,
    "username": "soumya@amba.com",
    "password": "soumya@123",
    "role":"User"
  },
  {
    "id": 102,
    "username": "anilan@amba.com",
    "password": "anilan@123",
    "role":"User"
  },
  {
    "id": 103,
    "username": "rakshithshankar@amba.com",
    "password": "rakshithshankar@123",
    "role":"User"
  },
  {
    "id": 104,
    "username": "saiskanda@amba.com",
    "password": "saiskanda@123",
    "role":"User"
  },
  {
    "id": 105,
    "username": "ravisantosh@amba.com",
    "password": "ravisantosh@123",
    "role":"User"
  },
  {
    "id": 106,
    "username": "jairam@amba.com",
    "password": "jairam@123",
    "role":"User"
  },
  {
    "id": 107,
    "username": "shreyass@amba.com",
    "password": "shreyass@123",
    "role":"User"
  },
  {
    "id": 108,
    "username": "mohak@amba.com",
    "password": "mohak@123",
    "role":"User"
  },
  {
    "id": 109,
    "username": "shakti@amba.com",
    "password": "shakti@123",
    "role":"User"
  },
  {
    "id": 110,
    "username": "dharshan@amba.com",
    "password": "dharshan@123",
    "role":"User"
  },
  {
    "id": 111,
    "username": "pramod@amba.com",
    "password": "pramod@123",
    "role":"User"
  },
  {
    "id": 112,
    "username": "chris@amba.com",
    "password": "chris@123",
    "role":"User"
  },
  {
    "id": 113,
    "username": "akshitha@amba.com",
    "password": "akshitha@123",
    "role":"User"
  },
  {
    "id": 114,
    "username": "ashrithm@amba.com",
    "password": "ashrithm@123",
    "role":"User"
  },
  {
    "id": 115,
    "username": "kushal@amba.com",
    "password": "kushal@123",
    "role":"User"
  },
  {
    "id": 116,
    "username": "tasbiha@amba.com",
    "password": "tasbiha@123",
    "role":"User"
  },
  {
    "id": 117,
    "username": "priya@amba.com",
    "password": "priya@123",
    "role":"User"
  },
  {
    "id": 118,
    "username": "satish@amba.com",
    "password": "satish@123",
    "role":"User"
  },
  {
    "id": 119,
    "username": "karthik@amba.com",
    "password": "karthik@123",
    "role":"User"
  },
  {
    "id": 120,
    "username": "kenith@amba.com",
    "password": "kenith@123",
    "role":"User"
  },
  {
    "id": 121,
    "username": "samyuktha@amba.com",
    "password": "samyuktha@123",
    "role":"User"
  },
  {
    "id": 122,
    "username": "jijo@amba.com",
    "password": "jijo@123",
    "role":"User"
  },
  {
    "id": 123,
    "username": "aditya@amba.com",
    "password": "aditya@123",
    "role":"User"
  },
  {
    "id": 124,
    "username": "hrishikesha@amba.com",
    "password": "hrishikesha@123",
    "role":"User"
  },
  {
    "id": 125,
    "username": "vinod@amba.com",
    "password": "vinod@123",
    "role":"User"
  },
  {
    "id": 126,
    "username": "sujith@amba.com",
    "password": "sujith@123",
    "role":"User"
  },
  {
    "id": 127,
    "username": "prakash@amba.com",
    "password": "prakash@123",
    "role":"User"
  },
  {
    "id": 128,
    "username": "ajayj@amba.com",
    "password": "ajayj@123",
    "role":"User"
  },
  {
    "id": 129,
    "username": "harsha@amba.com",
    "password": "harsha@123",
    "role":"User"
  },
  {
    "id": 130,
    "username": "sachin@amba.com",
    "password": "sachin@123",
    "role":"User"
  },
  {
    "id": 131,
    "username": "sandeepsingh@amba.com",
    "password": "sandeepsingh@123",
    "role":"User"
  },
  {
    "id": 132,
    "username": "abishek@amba.com",
    "password": "abishek@123",
    "role":"User"
  },
  {
    "id": 133,
    "username": "sagar@amba.com",
    "password": "sagar@123",
    "role":"User"
  },
  {
    "id": 134,
    "username": "manu@amba.com",
    "password": "manu@123",
    "role":"User"
  },
  {
    "id": 135,
    "username": "ganesh@amba.com",
    "password": "ganesh@123",
    "role":"User"
  },
  {
    "id": 136,
    "username": "rakesh@amba.com",
    "password": "rakesh@123",
    "role":"User"
  },
  {
    "id": 137,
    "username": "varun@amba.com",
    "password": "varun@123",
    "role":"User"
  },
  {
    "id": 138,
    "username": "vishal@amba.com",
    "password": "vishal@123",
    "role":"User"
  },
  {
    "id": 139,
    "username": "vinuth@amba.com",
    "password": "vinuth@123",
    "role":"User"
  },
  {
    "id": 140,
    "username": "sharika@amba.com",
    "password": "sharika@123",
    "role":"User"
  },
  {
    "id": 141,
    "username": "sunil@amba.com",
    "password": "sunil@123",
    "role":"User"
  },
  {
    "id": 142,
    "username": "soujanya@amba.com",
    "password": "soujanya@123",
    "role": "User"
  }
  
];

// This function will hash the passwords and save the file
async function createAndHashUsers() {
    for (const user of usersToCreate) {
        console.log(`Hashing password for user: ${user.username}...`);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt); // Replace plain text with hash
    }

    const dataFolderPath = path.join(__dirname, 'data');
    const usersFilePath = path.join(dataFolderPath, 'users.json');

    // Create the 'data' directory if it doesn't exist
    if (!fs.existsSync(dataFolderPath)) {
        fs.mkdirSync(dataFolderPath);
        console.log("Created 'data' directory.");
    }
    
    // Write the updated user data (with hashed passwords) to the file
    fs.writeFileSync(usersFilePath, JSON.stringify(usersToCreate, null, 2));
    
    console.log('----------------------------------------------------');
    console.log('SUCCESS: "data/users.json" has been created with secure passwords.');
    console.log('You can now run "node server.js" and log in.');
    console.log('----------------------------------------------------');
}

// Run the function
createAndHashUsers();