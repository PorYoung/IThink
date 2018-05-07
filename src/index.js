let component = ()=>{
    let div = document.createElement('div')
    let btn = document.createElement('btn')
    btn.innerHTML = 'Click'
    btn.onclick = (e)=>{
        console.log(e)
    }
    div.appendChild(btn)
    return div
}
document.body.appendChild(component())