import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL || 'postgres://localhost:5432/firststore'
)

export default sql ;
