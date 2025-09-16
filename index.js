const express=require('express')
require('dotenv').config()
const app=express()
const cors=require('cors')
const port=process.env.PORT || 5000
app.use(cors())
app.use(express.json())

//SXS4osQ4TiNXo8sU
//eventHive

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m0h4513.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

  const database=client.db('EventHive')
  const userCollection=database.collection('users')
   const eventCollection=database.collection('events')
  const bookedEventCollection=database.collection('BookedEvents')
app.post('/bookedEvents',async(req,res)=>{
  const bookedEvent=req.body
  const result=await bookedEventCollection.insertOne(bookedEvent)
  res.send(result)
})
app.get('/bookedEvents',async(req,res)=>{
    const cursor=bookedEventCollection.find()
    const result=await cursor.toArray()
    res.send(result)
})
app.get('/bookedEvents/email/:email',async(req,res)=>{
  const email=req.params.email
  const query={email:email}
    const result=await bookedEventCollection.find(query).toArray()
    res.send(result)
})
app.delete('/bookedEvents/:id',async(req,res)=>{
        const id=req.params.id;
   const query={_id:new ObjectId(id)}
   const result=await bookedEventCollection.deleteOne(query)
   res.send(result)
  })
app.post('/events',async(req,res)=>{
  const event=req.body
  const result=await eventCollection.insertOne(event)
  res.send(result)
})
app.get('/events',async(req,res)=>{
    const cursor=eventCollection.find()
    const result=await cursor.toArray()
    res.send(result)
})
app.get('/events/pagination',async(req,res)=>{
  const page=parseInt(req.query.page)
  const size=parseInt(req.query.size)
  const result=await eventCollection.find().skip(page*size).limit(size).toArray()
  res.send(result)
})
app.get('/events/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id:new ObjectId(id)}
    const result=await eventCollection.findOne(query)
    res.send(result)
})
app.patch('/events/:id',async(req,res)=>{
  const id=req.params.id;
  const query={_id:new ObjectId(id)}
  const event=req.body;
  const updateEvent={
    $set:{
      title:event.title,
      date:event.date,
      category:event.category,
      ticketTypes:[{type:event.ticketTypes[0].type,price:event.ticketTypes[0].price,quantity:event.ticketTypes[0].quantity},
    {type:event.ticketTypes[1].type,price:event.ticketTypes[1].price,quantity:event.ticketTypes[1].quantity},
  {type:event.ticketTypes[2].type,price:event.ticketTypes[2].price,quantity:event.ticketTypes[2].quantity}],
      location:event.location,
      description:event.description,
      image:event.image,
      time:event.time
    }
  }
  const result=await eventCollection.updateOne(query,updateEvent)
  res.send(result)
})
app.patch('/events/vip/:id',async(req,res)=>{
  const id=req.params.id;
  const event=req.body;
   const result = await eventCollection.updateOne(
      { _id: new ObjectId(id), "ticketTypes.type": "VIP" }, // find VIP type
      { $set: { "ticketTypes.$.quantity": event.vip } }     // update only VIP quantity
    );

    res.send(result);
})
app.patch('/events/regular/:id',async(req,res)=>{
  const id=req.params.id;
  const event=req.body;
   const result = await eventCollection.updateOne(
      { _id: new ObjectId(id), "ticketTypes.type": "Regular" }, // find Regular type
      { $set: { "ticketTypes.$.quantity": event.regular } }     // update only Regular quantity
    );

    res.send(result);
})
app.patch('/events/student/:id',async(req,res)=>{
  const id=req.params.id;
  const event=req.body;
   const result = await eventCollection.updateOne(
      { _id: new ObjectId(id), "ticketTypes.type": "Student" }, // find Student type
      { $set: { "ticketTypes.$.quantity": event.student } }     // update only Regular quantity
    );

    res.send(result);
})
app.delete('/events/:id',async(req,res)=>{
        const id=req.params.id;
   const query={_id:new ObjectId(id)}
   const result=await eventCollection.deleteOne(query)
   res.send(result)
  })

  app.post('/users',async(req,res)=>{
    const user=req.body
    const query={email:user.email}
    const existingUser=await userCollection.findOne(query)
    if(existingUser){
        return res.send({message:'User already exists',insertedId:null})
    }
    const result=await userCollection.insertOne(user)
    res.send(result)
  })
  app.patch('/users/:id',async(req,res)=>{
    const id=req.params.id
    const query={_id:new ObjectId(id)}
    const updateDoc={
        $set:{
            role:'admin'
        }
    }
    const result=await userCollection.updateOne(query,updateDoc)
    res.send(result)
  })
  app.get('/users/:id',async(req,res)=>{
    const id=req.params.id;
   const query={_id:new ObjectId(id)}
   const result=await userCollection.findOne(query)
   res.send(result)
  })
  app.delete('/users/:id',async(req,res)=>{
        const id=req.params.id;
   const query={_id:new ObjectId(id)}
   const result=await userCollection.deleteOne(query)
   res.send(result)
  })
  app.get('/users/admin/:email',async(req,res)=>{
     const email=req.params.email
    const query={email:email}
    const user=await userCollection.findOne(query)
    let admin=false;
    if(user){
        admin=user?.role==='admin'
    }
    res.send({admin})
  })
app.get('/users',async(req,res)=>{
    const cursor=userCollection.find()
    const result=await cursor.toArray()
    res.send(result)
})
app.get('/admin-stats',async(req,res)=>{
  const events=await eventCollection.estimatedDocumentCount()
  const users=await userCollection.estimatedDocumentCount()
  const soldTicket=await bookedEventCollection.estimatedDocumentCount()
  res.send({events,users,soldTicket})
})
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Event Hive is starting')
})
app.listen(port,()=>{
    console.log(`Event Hive is Starting Port ${port}`)
})