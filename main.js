const audio=document.getElementById("audio")

const grid=document.getElementById("grid")
const searchInput=document.getElementById("searchInput")
const searchBtn=document.getElementById("searchBtn")

const playBtn=document.getElementById("play")
const nextBtn=document.getElementById("next")
const prevBtn=document.getElementById("prev")

const volume=document.getElementById("volume")

const playlistList=document.getElementById("playlistList")
const playlistName=document.getElementById("playlistName")
const createPlaylistBtn=document.getElementById("createPlaylistBtn")

const homeBtn=document.getElementById("homeBtn")
const albumBtn=document.getElementById("albumBtn")

const cover=document.getElementById("cover")
const song=document.getElementById("song")
const artist=document.getElementById("artist")
const bg=document.getElementById("bg")
const addNow=document.getElementById("addNow")
const title=document.getElementById("title")

let tracks=[]
let index=0
let playing=false
let active=null

let playlists=JSON.parse(localStorage.getItem("nx"))||{}

async function fetchSongs(q){
const r=await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=25`)
const d=await r.json()
return d.results.filter(x=>x.previewUrl).map(t=>({
title:t.trackName,
artist:t.artistName,
cover:t.artworkUrl100.replace("100x100","300x300"),
src:t.previewUrl
}))
}

async function fetchAlbums(q){
const r=await fetch(`https://itunes.apple.com/search?term=${q}&entity=album&limit=20`)
const d=await r.json()
return d.results.map(t=>({
title:t.collectionName,
artist:t.artistName,
cover:t.artworkUrl100.replace("100x100","300x300"),
id:t.collectionId
}))
}

async function fetchAlbumTracks(id){
const r=await fetch(`https://itunes.apple.com/lookup?id=${id}&entity=song`)
const d=await r.json()
return d.results.slice(1).filter(x=>x.previewUrl).map(t=>({
title:t.trackName,
artist:t.artistName,
cover:t.artworkUrl100.replace("100x100","300x300"),
src:t.previewUrl
}))
}

function render(list){
grid.innerHTML=""

list.forEach((t,i)=>{
const c=document.createElement("div")
c.className="card"

c.innerHTML=`
<img src="${t.cover}">
<p>${t.title}</p>
<small>${t.artist}</small>
<button>＋</button>
`

c.onclick=()=>{
tracks=list
index=i
load()
play()
}

c.querySelector("button").onclick=e=>{
e.stopPropagation()
if(!active)return alert("Select playlist first")
playlists[active].push(t)
save()
}

grid.appendChild(c)
})
}

function renderAlbums(list){
grid.innerHTML=""

list.forEach(a=>{
const c=document.createElement("div")
c.className="card"

c.innerHTML=`
<img src="${a.cover}">
<p>${a.title}</p>
<small>${a.artist}</small>
`

c.onclick=async()=>{
const songs=await fetchAlbumTracks(a.id)
tracks=songs
index=0
render(songs)
load()
play()
}

grid.appendChild(c)
})
}

function renderSection(titleText,list){

const h=document.createElement("h2")
h.textContent=titleText
h.style.margin="15px 0 10px"
grid.appendChild(h)

list.forEach((t,i)=>{
const c=document.createElement("div")
c.className="card"

c.innerHTML=`
<img src="${t.cover}">
<p>${t.title}</p>
<small>${t.artist}</small>
<button>＋</button>
`

c.onclick=()=>{
tracks=list
index=i
load()
play()
}

c.querySelector("button").onclick=e=>{
e.stopPropagation()
if(!active)return alert("Select playlist first")
playlists[active].push(t)
save()
}

grid.appendChild(c)
})
}

async function getTracks(q){
const r=await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=25`)
const d=await r.json()
return d.results.filter(x=>x.previewUrl).map(t=>({
title:t.trackName,
artist:t.artistName,
cover:t.artworkUrl100.replace("100x100","300x300"),
src:t.previewUrl
}))
}

async function home(){

const rap=await getTracks("rap hip hop trap eminem drake kanye kendrick 50 cent pop smoke")
const classics=await getTracks(" trending blues sam cooke")

grid.innerHTML=""

renderSection("🔥 Rap Trending",rap)
renderSection("🎼 Classics Trending",classics)

tracks=rap
index=0
load()
}

function load(){
const t=tracks[index]
if(!t)return

audio.src=t.src
cover.src=t.cover
song.textContent=t.title
artist.textContent=t.artist
bg.style.backgroundImage=`url(${t.cover})`
}

function play(){
audio.play()
playing=true
playBtn.textContent="⏸"
}

function pause(){
audio.pause()
playing=false
playBtn.textContent="▶"
}

playBtn.onclick=()=>playing?pause():play()

nextBtn.onclick=()=>{
if(!tracks.length)return
index=(index+1)%tracks.length
load()
play()
}

prevBtn.onclick=()=>{
if(!tracks.length)return
index=(index-1+tracks.length)%tracks.length
load()
play()
}

volume.oninput=e=>audio.volume=e.target.value

addNow.onclick=()=>{
if(!active)return alert("Select playlist first")
playlists[active].push(tracks[index])
save()
}

function save(){
localStorage.setItem("nx",JSON.stringify(playlists))
renderPlaylists()
}

function renderPlaylists(){
playlistList.innerHTML=""

Object.keys(playlists).forEach(n=>{
const li=document.createElement("li")
li.innerHTML=`<span>${n}</span><span>✖</span>`

li.onclick=()=>{
active=n
tracks=playlists[n]
index=0
render(tracks)
load()
}

li.children[1].onclick=e=>{
e.stopPropagation()
delete playlists[n]
save()
}

playlistList.appendChild(li)
})
}

searchBtn.onclick=async()=>{
const q=searchInput.value.trim()
if(!q)return
tracks=await fetchSongs(q)
index=0
render(tracks)
load()
}

albumBtn.onclick=async()=>{
const res=await fetchAlbums("top albums")
renderAlbums(res)
}

homeBtn.onclick=home

searchInput.onkeydown=e=>{
if(e.key==="Enter")searchBtn.onclick()
}

home()
renderPlaylists()
volume.value=0.7
audio.volume=0.7