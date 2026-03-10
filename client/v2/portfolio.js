'use strict'

let currentDeals=[]
let currentPagination={}
let activeFilters=[]
let favorites=JSON.parse(localStorage.getItem("legoFavorites")||"[]")

const selectShow=document.querySelector('#show-select')
const selectPage=document.querySelector('#page-select')
const selectSort=document.querySelector('#sort-select')
const filters=document.querySelectorAll('#filters span')

const sectionDeals=document.querySelector('#deals')

const spanNbDeals=document.querySelector('#nbDeals')
const spanNbSales=document.querySelector('#nbSales')

const selectLegoSetIds=document.querySelector('#lego-set-id-select')

const API="https://lego-api-blue.vercel.app"

const setCurrentDeals=({result,meta})=>{
currentDeals=result
currentPagination=meta
}

const fetchDeals=async(page=1,size=6)=>{

const response=await fetch(`${API}/deals?page=${page}&size=${size}`)
const body=await response.json()

if(!body.success) return

return body.data
}

const fetchSales=async(id)=>{

const response=await fetch(`${API}/sales?id=${id}`)
const body=await response.json()

if(!body.success) return []

return body.data
}

const toggleFavorite=(uuid)=>{

if(favorites.includes(uuid))
favorites=favorites.filter(f=>f!==uuid)
else
favorites.push(uuid)

localStorage.setItem("legoFavorites",JSON.stringify(favorites))

renderDeals(applyFilters())
}

const renderDeals=(deals)=>{

sectionDeals.innerHTML=""

deals.forEach(deal=>{

const div=document.createElement('div')
div.className="deal"

const isFav=favorites.includes(deal.uuid)

div.innerHTML=`
<div>
<span class="favorite ${isFav?"active":""}" data-id="${deal.uuid}">
${isFav ? "⭐" : "☆"}
</span>
</div>

<div class="deal-title">${deal.title}</div>

<div>ID: ${deal.id}</div>

<div class="deal-price">${deal.price}€</div>

<a href="${deal.link}" target="_blank">Open deal</a>
`

sectionDeals.appendChild(div)

})

document.querySelectorAll(".favorite").forEach(btn=>{
btn.onclick=(e)=>toggleFavorite(e.target.dataset.id)
})

}

const renderPagination=(pagination)=>{

const {currentPage,pageCount}=pagination

let options=""

for(let i=1;i<=pageCount;i++)
options+=`<option value="${i}">${i}</option>`

selectPage.innerHTML=options
selectPage.value=currentPage

}

const renderIndicators=(pagination)=>{

spanNbDeals.innerText=pagination.count

}

const renderLegoSetIds=(deals)=>{

const ids=[...new Set(deals.map(d=>d.id))]

selectLegoSetIds.innerHTML=ids.map(id=>`<option>${id}</option>`).join("")
}

const applyFilters=()=>{

let deals=[...currentDeals]

if(activeFilters.includes("discount"))
deals=deals.filter(d=>d.discount>50)

if(activeFilters.includes("comments"))
deals=deals.filter(d=>d.comments>15)

if(activeFilters.includes("hot"))
deals=deals.filter(d=>d.temperature>100)

if(activeFilters.includes("favorites"))
deals=deals.filter(d=>favorites.includes(d.uuid))

return sortDeals(deals)
}

const sortDeals=(deals)=>{

const sort=selectSort.value

switch(sort){

case "price-asc":
deals.sort((a,b)=>a.price-b.price)
break

case "price-desc":
deals.sort((a,b)=>b.price-a.price)
break

case "date-desc":
deals.sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt))
break

case "date-asc":
deals.sort((a,b)=>new Date(a.publishedAt)-new Date(b.publishedAt))
break

}

return deals
}

filters.forEach(btn=>{

btn.addEventListener("click",()=>{

const f=btn.dataset.filter

btn.classList.toggle("active")

if(activeFilters.includes(f))
activeFilters=activeFilters.filter(x=>x!==f)
else
activeFilters.push(f)

renderDeals(applyFilters())

})

})

selectShow.addEventListener('change',async(e)=>{

const deals=await fetchDeals(1,parseInt(e.target.value))

setCurrentDeals(deals)

render()

})

selectPage.addEventListener("change",async(e)=>{

const deals=await fetchDeals(parseInt(e.target.value),selectShow.value)

setCurrentDeals(deals)

render()

})

selectSort.addEventListener("change",()=>{

renderDeals(applyFilters())

})

selectLegoSetIds.addEventListener("change",async(e)=>{

const sales=await fetchSales(e.target.value)

spanNbSales.innerText=sales.length

})

const render=()=>{

renderDeals(applyFilters())

renderPagination(currentPagination)

renderIndicators(currentPagination)

renderLegoSetIds(currentDeals)

}

document.addEventListener('DOMContentLoaded',async()=>{

const deals=await fetchDeals()

setCurrentDeals(deals)

render()

})