import { FastifyInstance } from 'fastify'
import {z} from 'zod'
import {prisma} from './lib/prisma'
import dayjs from 'dayjs'

export async function AppRoutes(app: FastifyInstance) {
    // rota para criar um user
    app.post('/user', async (request) => {
        const postBody  = z.object({
                username: z.string(),
                password: z.string(), 
                email: z.string()       
            })
        const {username, password, email} = postBody.parse(request.body)
        const created_at = dayjs().startOf('day').toDate() // sem hora, minuto e segundo
        const newUser = await prisma.user.create({
            data: {
                username,
                password, 
                email,
                created_at
        }
        })
        return newUser
    })

     // rota para recuperar um user
     app.post('/user/login', async (request) => {
        const postBody  = z.object({
                username: z.string(),
                password: z.string(), 
            })
        const {username, password } = postBody.parse(request.body)
        const user = await prisma.user.findMany({
            where: {
                username: username,
                password: password
            }
        })
        return user
    })

    // define uma rota que consulta todos os usuários cadastrados no banco de dados
    app.get('/users', async () => {
        const users = await prisma.user.findMany()
        return users
    })

    // define uma rota que consulta todos os mensagems cadastrados no banco de dados
        app.get('/messages', async () => {
            const messages = await prisma.message.findMany()
            return messages
        })

// rota para criar um mensagem
    // define uma rota que cria um mensagem no banco de dados, usando o verbo post, com um usuário
    app.post('/message', async (request) => {
        // recupera os dados do corpo da requisição
        const createMessageBody = z.object({
            id: z.number(),
            title: z.string(),
            content: z.string(),
//            published: z.boolean(),
            //likesQty: z.number(),
            userId: z.number()
        })
        const {title, content, userId} = createMessageBody.parse(request.body)
        // insere o mensagem no banco de dados
        // recupera a data atual - de hoje
        const today = dayjs().startOf('day').toDate() // sem hora, minuto e segundo
        let newMessage = await prisma.message.create({
            data: {
                title: title,
                content: content,
                published: true,
                likesQty: 0,
                created_at: today,
                userId
            }
        })
        return newMessage
    })

    
// recupera todos os mensagems de um usuário
    app.get('/messages/:userId', async (request) => {
        const userIdParams = z.object({
            userId: z.string()
        })
        const {userId} = userIdParams.parse(request.params)
        const messages = await prisma.message.findMany({
            where: {
                userId: Number(userId)
            }
        })
        return messages
    })

    
    app.patch('/message/addlike', async (request) => {
        const addlikeBody = z.object({
            id: z.number(),
            userId: z.number(),
            likesQty: z.number(),
        })
        const {id, userId, likesQty} = addlikeBody.parse(request.body)

        let messageUpdated = await prisma.message.update({
            where: {
                id: id
            },
            data: {
                likesQty: {
                    increment: 1
                }
            }
        })

        const today = dayjs().startOf('day').toDate() // sem hora, minuto e segundo
        await prisma.control.create({
            data: {
                type: "C", 
                quantity: likesQty,
                created_at: today,
                userId,
                messageId: id
            }
        })
        return messageUpdated
    })

    //Passo 5. Lista os controls
app.get('/controls', async () => {
        const controls = await prisma.control.findMany()
        return controls
    })

   // Passo 6. Lista os controls de um usuário
app.get('/controls/:userId', async (request) => {
        const userIdParams = z.object({
            userId: z.string()
        })
        const {userId} = userIdParams.parse(request.params)
        const controls = await prisma.control.findMany({
            where: {
                userId: Number(userId)
            }
        })
        return controls
    })

   // Passo 7. Realiza um like
// rota pra atualizar e remover like
    app.patch('/message/removeLike', async (request) => {
        const removeBody = z.object({
            id: z.number(),
            x: z.number(),
            userId: z.number(),
        })
        const {id, x, userId} = removeBody.parse(request.body)

        let resp = await prisma.message.updateMany({
            where: {
                id: id,
                likesQty: {
                    gte: x
                }
            },
            data: {
                likesQty: {
                    decrement: 1
                }
            }
        })

    //  return resp.count
        if ((resp.count) > 0){
            const today = dayjs().startOf('day').toDate() // sem hora, minuto e segundo
            await prisma.control.create({
                data: {
                    type: "V", 
                    quantity: x,
                    created_at: today,
                    userId,
                    messageId: id
                }
            })
            return 1 
        }
        else {
            return 0 
        }
    })

    // rota para remover um mensagem, usando o verbo delete
    app.delete('/message/:id', async (request) => {
        // recupera o id para remoção
        const idParam = z.object({
            id: z.string()
        })
        const {id} = idParam.parse(request.params)
        // remove o mensagem
        let messageDeleted = await prisma.message.delete({
            where: {
                id: Number(id)
            }
        })
        return messageDeleted
    })

}