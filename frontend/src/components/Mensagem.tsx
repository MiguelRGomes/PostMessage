import {useState, useEffect} from 'react'
import { FiTrash2 } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { FiThumbsUp, FiThumbsDown  } from 'react-icons/fi' 

interface Message { // tipo de dado
    id: number;
    title: string;
    content: string;
    likesQty: number;
  }

const Mensagem = () => {
    const [id] = useState(0); // variável do formulário
    const [title, setTitle] = useState(''); // variável do formulário
    const [content, setContent] = useState(''); // variável do formulário
    const [likesQty, setLikesQty] = useState(0); // variável do formulário
  // variável que guarda todos os mensagens
    const [messages, setMessages] = useState<Message[]>([]);
    //  vai nos permitir recuperar o userId passado do Login para o mensagem
    const location = useLocation();
    // efetivamente recupera o userId a partir do estado
    const userId = location.state?.userId || '';

    useEffect(() => {
        const fetchMessages = async () => {
          try {
            const response = await fetch(`http://localhost:3333/messages/${userId}`);
            const data = await response.json();
    
            if (response.ok) {
              setMessages(data);
            } else {
              console.error('Failed to fetch messages');
            }
          } catch (error) {
            console.error('Error:', error);
          }
        };
    
        fetchMessages();
      }, [userId]);

      useEffect(() => {
        setMessages(messages);
      }, [messages]);

      // cria um mensagem no banco de dados e atualiza a lista de mensagens
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        const messageData = { // tipo de dados para enviar ao backend
          id,
          title,
          content,
          likesQty,
          userId
        };
   
        try {
          const newMessage = await fetch('http://localhost:3333/message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageData),
          })
          .then (resp => {
            return resp.json()
          })
    
           // Limpar os campos do formulário
            setTitle('');
            setContent('');
            setLikesQty(0);

            //atualiza lista de mensagem com o novo mensagem
            setMessages((prevMessageList) => [...prevMessageList, newMessage]);
          
        } catch (error) {
          console.error('Error:', error);
        }
      };

      const handleRemoveMessage = async (id: Number) => {
        // Lógica para fazer a requisição DELETE para a rota /mensagem/:id
        // Utilize o userId e productId para formar a URL correta
      
        // Exemplo de requisição DELETE utilizando fetch:
       await fetch(`http://localhost:3333/message/${id}`, {
          method: 'DELETE',
        })
          .then(response => {
            return response.json()
        })
          .catch(error => {
            alert(error)
          });
        // atualiza lista de mensagem, retirando o mensagem desejado

        setMessages(messages.filter((message) => message.id !== id));
      };

      const handleBuyMessage = async (id: Number) => {
        // Lógica para fazer a requisição ATUALIZAÇAO para a rota /mensagem/:id
        // Utilize o userId e productId para formar a URL correta
        const likesQty = 1
        const buyData = {
            id,
            userId,
            likesQty,
          };
              
        // Exemplo de requisição PATCH utilizando fetch:
       const newMessage = await fetch(`http://localhost:3333/message/addlike`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buyData),
        })
        .then(response => {
            return response.json()
        })
          .catch(error => {
            alert(error)
          });

        // Encontre o índice do mensagem atualizado na lista
        const index = messages.findIndex((message) => message.id === newMessage.id);
        if (index !== -1) {
          setMessages((prevMessageList) => {
              const newMessageList = [...prevMessageList];
              newMessageList[index] = newMessage;
              return newMessageList;
        });
        }
      };

      const handleRemoveLike = async (id: Number) => {
        // Lógica para fazer a requisição ATUALIZAÇAO para a rota /mensagem/:id
        // Utilize o userId para formar a URL correta
        const likesQty = 1
        const buyData = {
            id,
            userId,
            likesQty,
          };

        // Exemplo de requisição PATCH utilizando fetch:
       const newMessage = await fetch(`http://localhost:3333/message/removeLike`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buyData),
        })
        .then(response => {
            return response.json()
        })
          .catch(error => {
            alert(error)
          });

        // Encontre o índice do mensagem atualizado na lista
        const index = messages.findIndex((message) => message.id === newMessage.id);
        if (index !== -1) {
          setMessages((prevMessageList) => {
              const newMessageList = [...prevMessageList];
              newMessageList[index] = newMessage;
              return newMessageList;
        });
        }
      };

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen">
          <div className="max-w-md mx-auto">
            {/* inicia o formulário para cadastrar um mensagem */ }
             <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-4">
              <div>
            <label htmlFor="title" className="block font-semibold">
              Titulo:
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="content" className="block font-semibold">
              Descrição:
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-md hover:bg-blue-600"
          >
            Comentar
          </button>
        </form>
{/* inicia a tabela para listar os mensagens */ }
        <div className="max-w-md mx-auto mb-4">
      <h2 className="text-2xl font-bold mb-4">Lista de Comentários</h2>
      <table className="w-full border border-gray-300">
        <thead>
          <tr>
            <th className="border-b border-gray-300 py-2 px-4">Titulo</th>
            <th className="border-b border-gray-300 py-2 px-4">Descrição</th>
            <th className="border-b border-gray-300 py-2 px-4">Likes</th>
            <th className="border-b border-gray-300 py-2 px-4">Remover Comentário</th>
            <th className="border-b border-gray-300 py-2 px-4">Like</th>
            <th className="border-b border-gray-300 py-2 px-4">Remover Like</th>
          </tr>
        </thead>
        <tbody>
          {/* percorre a lista de mensagens */}
          {messages.map((message) => (
            <tr key={message.id}>
              <td className="border-b border-gray-300 py-2 px-4">{message.title}</td>
              <td className="border-b border-gray-300 py-2 px-4">{message.content}</td>
              <td className="border-b border-gray-300 py-2 px-4">{message.likesQty}</td>
              <td className="border-b border-gray-300 py-2 px-4">
                <button
                  onClick={() => handleRemoveMessage(message.id)}
                  className="flex items-center justify-center p-2 text-red-500 hover:text-red-700"
                >
                  <FiTrash2 size={20} />
                </button>
              </td>
              <td className="border-b border-gray-300 py-2 px-4">
                <button onClick={() => handleBuyMessage(message.id)} className="flex items-center justify-center p-2 text-green-500 hover:text-green-700">
                <FiThumbsUp size={20}/>
                </button>
              </td>
              <td className="border-b border-gray-300 py-2 px-4">
                <button onClick={() => handleRemoveLike(message.id)} className="flex items-center justify-center p-2 text-green-500 hover:text-green-700">
                  <FiThumbsDown  size={20}/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

      </div>
</div>

      

    )
}

export default Mensagem