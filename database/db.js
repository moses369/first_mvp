import postgres from 'postgres';
const sql = postgres(process.env.DATABSE_URL || 'postgres://localhost:5432/firststore',{
   ssl:false
}
)

export default sql ;
