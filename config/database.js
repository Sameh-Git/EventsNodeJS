const mongosse=require('mongoose')
mongosse.connect('mongodb://localhost:27017/eventsDB',(err)=>{
    if(err){
        console.log(err)
    }else{
        console.log('connected to db succesfuly...')
    }
})