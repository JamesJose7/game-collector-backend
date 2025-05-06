const axios = require('axios');
const db = require('./prev_db.json');

// Axios config
const token = '<TOKEN>'
const auth = `Bearer ${token}`

// Map data
let games = db.library.games;
let platforms = db.library.platforms;
let platformsNames = platforms.map(platform => platform.name);
let platformsIDs = platforms.map(platform => platform.id);

let switchGames = Object.values(games['0'])
let wiiUGames = Object.values(games['1'])
let nintendo3DSGames = Object.values(games['2'])
let wiiGames = Object.values(games['3'])
let dsGames = Object.values(games['4'])

// Axios config
let axiosPostGameConfig = {
    method: 'POST',
    url: '<URL>/api/games',
    headers: {
        'Authorization': auth
    }
}

// ///////////////////////////// SWITCH GAMES
const switchPlatformName = 'Nintendo Switch'
const switchPlatformId = 'n7fbqyLYkFKrhgpmwpb7'
// switchGames.forEach((game, i) => {
//     setTimeout(() => {
//         let isoDate = new Date(parseInt(game.dateAdded)).toISOString();
//         let newGame = {
//             dateAdded: isoDate,
//             imageUri: game.imageUri,
//             isPhysical: game.isPhysical,
//             name: game.name,
//             shortName: '',
//             platformId: switchPlatformId,
//             platform: switchPlatformName,
//             publisherId: '',
//             publisher: game.publisher,
//             timesCompleted: game.timesCompleted
//         }
//         // Upload games
//         axiosPostGameConfig.data = newGame
//         axios(axiosPostGameConfig)
//             .then(response => {
//                 console.log('success :'  + i)
//             })
//             .catch(error => {
//                 console.log('failed :' + i)
//             })
//     }, i * 5000);
// })

// let completed = 0;
// wiiUGames.forEach(game => {
//     if (game.timesCompleted > 0)
//         completed++;
// })
// console.log('completed: ' + completed)

// ////////////////////////// WII U GAMES

const wiiuPlatformName = 'Wii U'
const wiiuPlatformId = 'c3NTCFaOoWajDdOUxgWr'
// wiiUGames.forEach((game, i) => {
//     setTimeout(() => {
//         let isoDate = new Date(parseInt(game.dateAdded)).toISOString();
//         let newGame = {
//             dateAdded: isoDate,
//             imageUri: game.imageUri,
//             isPhysical: game.isPhysical,
//             name: game.name,
//             shortName: '',
//             platformId: wiiuPlatformId,
//             platform: wiiuPlatformName,
//             publisherId: '',
//             publisher: game.publisher,
//             timesCompleted: game.timesCompleted
//         }
//         // Upload games
//         axiosPostGameConfig.data = newGame
//         axios(axiosPostGameConfig)
//             .then(response => {
//                 console.log('success :'  + i)
//             })
//             .catch(error => {
//                 console.log('failed :' + i)
//             })
//     }, i * 5000);
// })


// ////////////////////////// 3DS GAMES


const n3dsPlatformName = 'Nintendo 3DS'
const n3dsPlatformId = 'IqIJRtjFGnWTXz2UesXE'
// nintendo3DSGames.forEach((game, i) => {
//     setTimeout(() => {
//         let isoDate = new Date(parseInt(game.dateAdded)).toISOString();
//         let newGame = {
//             dateAdded: isoDate,
//             imageUri: game.imageUri,
//             isPhysical: game.isPhysical,
//             name: game.name,
//             shortName: '',
//             platformId: n3dsPlatformId,
//             platform: n3dsPlatformName,
//             publisherId: '',
//             publisher: game.publisher,
//             timesCompleted: game.timesCompleted
//         }
//         // Upload games
//         axiosPostGameConfig.data = newGame
//         axios(axiosPostGameConfig)
//             .then(response => {
//                 console.log('success :'  + i)
//             })
//             .catch(error => {
//                 console.log('failed :' + i)
//             })
//     }, i * 5000);
// })

// ///////// WII GAMES

// const wiiPlatformName = 'Wii'
// const wiiPlatformId = 'fHLtX6WGiTU0qQyxNx4X'
// wiiGames.forEach((game, i) => {
//     setTimeout(() => {
//         let isoDate = new Date(parseInt(game.dateAdded)).toISOString();
//         let newGame = {
//             dateAdded: isoDate,
//             imageUri: game.imageUri,
//             isPhysical: game.isPhysical,
//             name: game.name,
//             shortName: '',
//             platformId: wiiPlatformId,
//             platform: wiiPlatformName,
//             publisherId: '',
//             publisher: game.publisher,
//             timesCompleted: game.timesCompleted
//         }
//         // Upload games
//         axiosPostGameConfig.data = newGame
//         axios(axiosPostGameConfig)
//             .then(response => {
//                 console.log('success')
//             })
//             .catch(error => {
//                 console.log(error)
//             })
//     }, i * 1000);
// })

//  ////////////////// DS GAMES

// Test upload with DS games
// const nintendoDSPlatformName = 'Nintendo DS'
// const nintendoDSPlatformId = 'SzLYqeVXISKAGxbTGD2K'
// dsGames.forEach((game, i) => {
//     setTimeout(() => {
//         let isoDate = new Date(parseInt(game.dateAdded)).toISOString();
//         let newGame = {
//             dateAdded: isoDate,
//             imageUri: game.imageUri,
//             isPhysical: game.isPhysical,
//             name: game.name,
//             shortName: '',
//             platformId: nintendoDSPlatformId,
//             platform: nintendoDSPlatformName,
//             publisherId: '',
//             publisher: game.publisher,
//             timesCompleted: game.timesCompleted
//         }
//         // Upload games
//         axiosPostGameConfig.data = newGame
//         axios(axiosPostGameConfig)
//             .then(response => {
//                 console.log('success')
//             })
//             .catch(error => {
//                 console.log(error)
//             })
//     }, i * 1000);
// })

// ///////////////////////////////// DATA CHECK

// const temp = require('./temp.json')
// let total = 0;
// let completed = 0;
// let phys = 0;
// let dig = 0;
// temp.forEach(game => {
//     total++;
//     if (game.timesCompleted > 0)
//         completed++;
//     if (game.isPhysical)
//         phys++;
//     else
//         dig++;
// })
// console.log('total: ' + total)
// console.log('completed: ' + completed)
// console.log('physical: ' + phys)
// console.log('digital: ' + dig)