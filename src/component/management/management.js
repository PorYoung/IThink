import './management.less'
import '../router'
import {myLoading,myLoadingSuccess,myLoadingFail} from '../myLoading'
window.$ = require('../../lib/jquery-3.3.1.min')
qRouter.init()
qRouter.go('/')

const host = 'management'
qRouter.on('/',(req)=>{
    $('.right .active').removeClass('active')
    $('.right .info').addClass('active')
})
qRouter.on('/:panel',(req)=>{
    let panel = req.params.panel
    if($('.right .'.concat(panel)).length === 0){
        return qRouter.go('/')
    }
    $('.right .active').removeClass('active')
    $('.right .'.concat(panel)).addClass('active')
    if(panel==='recommendation' && Object.keys(req.query).length > 0){
        let query = req.query.type
        if($('.right .recommendation .form-'.concat(query)) === 0){
            return qRouter.go('/recommendation')
        }
        $('.right .recommendation form .active').removeClass('active')
        $('.right .recommendation .form-'.concat(query)).addClass('active')
    }else{
        $('.right .recommendation form .active').removeClass('active')
        $('.right .recommendation .form-all').addClass('active')
    }
})

$(($)=>{
    //recommendation submit
    $('.right .recommendation form .submit').click((e)=>{
        e.preventDefault()
        let btn = e.target
        let form = btn.parentNode
        let date = $(form).find('input[type=date]').val()
        if(!date){
            return
        }
        let isEmpty = false
        if(form.className.includes('music')){
            let fileDoms = $(form).find('input[type=file]')
            let musicFile = fileDoms[0].files[0]
            let coverFile = fileDoms[1].files[0]
            let inputs = $(form).find('input[type=text]')
            if(!!musicFile){
                if(!/audio/.test(musicFile.type)){
                    return alert('audio file type illegal')
                }
                if(!!coverFile){
                    if(!/image/.test(coverFile.type)){
                        return alert('image file type illegal')
                    }
                    for(let i of inputs){
                        if(i.name.includes('Url')){
                            continue
                        }
                        if(i.value===''){
                            isEmpty = true
                        }
                    }
                }else{
                    for(let i of inputs){
                        if(i.name.includes('musicUrl')){
                            continue
                        }
                        if(i.value===''){
                            isEmpty = true
                        }
                    }
                }
            }else{
                for(let i of inputs){
                    if(i.value===''){
                        isEmpty = true
                    }
                }
            }
        }else{
            let fileDom = $(form).find('input[type=file]')[0]
            let file = fileDom.files[0]
            let inputs = $(form).find('input[type=text]')
            if(!!file && file.size > 0){
                if(!/image/.test(file.type)){
                    return alert('file type illegal')
                }
                for(let i of inputs){
                    if(i.name.includes('Url')){
                        continue
                    }
                    if(i.value===''){
                        isEmpty = true
                    }
                }
            }else{
                for(let i of inputs){
                    if(i.value===''){
                        isEmpty = true
                    }
                }
            }
        }
       
        if(isEmpty){
            return alert('form cannot be empty')
        }

        let type = ''
        if(form.className.includes('music')){
            type = 'music'
        }else if(form.className.includes('news')){
            type = 'news'
        }else if(form.className.includes('book')){
            type = 'book'
        }
        let formdata = new FormData(form)
        formdata.append('type',type)

        //disable
        btn.disabled = true
        let clearMyLoading = myLoading()
        let tickCount = new Date().getTime()
        $.ajax({
            url: '/management/uploadRecommendation',
            type: 'POST',
            contentType:false,
            processData:false,
            data:formdata,
            success:(res)=>{
                if(res != '-1'){
                    form.reset()
                    btn.disabled = false
                    let gap = new Date().getTime() - tickCount
                    if(gap > 1200){
                        clearMyLoading()
                        myLoadingSuccess('',1200)
                    }else{
                        setTimeout(()=>{
                            clearMyLoading()
                            myLoadingSuccess('',1200)
                        },1200)
                    }
                }else{
                    let gap = new Date().getTime() - tickCount
                    if(gap > 1200){
                        clearMyLoading()
                        myLoadingFail('',1200)
                    }else{
                        setTimeout(()=>{
                            clearMyLoading()
                            myLoadingFail('',1200)
                        },1200)
                    }
                }
                console.log(res)
            }
        })
    })
    $('.right .recommendation form textarea').on('change', (e)=>{
        let textarea = e.target
        let len = textarea.value===''?0:textarea.value.length
        $(textarea).parent().children('label').html('content:(字数:'+len+')')
    })
})