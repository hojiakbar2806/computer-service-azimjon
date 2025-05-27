import { MongoClient } from "mongodb"

const uri = "mongodb+srv://mongouser:nR46H8hgKjgwOPB3@mongocluster.nuzxaze.mongodb.net/?retryWrites=true&w=majority&appName=MongoCluster";
const client = new MongoClient(uri)

const db = client.db("service")

async function connect(){
    await client.connect()
    console.log("Mongo db ga ulandi")
}

export {db, connect}