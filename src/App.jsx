import "./App.css";
import { useState, useEffect } from "react";
import Parse from "parse";
import { Bounce, toast, ToastContainer } from "react-toastify";

const priorityLevels = {
  "Baixa": 1,
  "Média": 2,
  "Alta": 3,
  "Urgente": 4
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Baixa");
  const [editingId, setEditingId] = useState(null);

  const databaseConnection = () => {
    Parse.initialize("lxgVr5EmPSRW9z0e8GCpy8BAyW6JSI5lq3Sachwd", "go8jVokvfkDR3PFBialcZAWV4HpjCYNhanfIVnQD");
    Parse.serverURL = "https://parseapi.back4app.com";
  }

  useEffect(() => {
    databaseConnection()
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const Task = Parse.Object.extend("Task");
    const query = new Parse.Query(Task);
    query.descending("priority");
    const results = await query.find();
    setTasks(results.map((task) => ({
      id: task.id,
      description: task.get("description"),
      priority: Object.keys(priorityLevels).find(key => priorityLevels[key] === task.get("priority")),
    })));
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task) return;
  
    if (editingId) {
      await updateTask(editingId, task, priorityLevels[priority]);
    } else {
      await createTask(task, priorityLevels[priority]);
    }
    
    setTask("");
    setPriority("Baixa");
    setEditingId(null);
  };
  

  const createTask = async (description, priority) => {
    const Task = Parse.Object.extend("Task");
    const newTask = new Task();
  
    newTask.set("description", description);
    newTask.set("priority", priority);
  
    try {
      await newTask.save();

      toast.success('Tarefa criada com sucesso!')

      fetchTasks();
    } catch (error) {

      toast.error(`Erro ao criar a tarefa: ${error.message}`)
    }
  };

  const updateTask = async (id, description, priority) => {
    const Task = Parse.Object.extend("Task");
    const query = new Parse.Query(Task);

    try {
      const task = await query.get(id);
      
      task.set("description", description);
      task.set("priority", priority);
      
      await task.save();

      toast.success('Tarefa atualizada com sucesso!')

      fetchTasks();
    } catch (error) {

      toast.error(`Erro ao atualizar a tarefa: ${error.message}`)
    }
  };
  
  const deleteTask = async (id) => {

    try {
      const Task = Parse.Object.extend("Task");
      const query = new Parse.Query(Task);
      const task = await query.get(id);
    
      await task.destroy();

      toast.success('Tarefa excluída com sucesso!')

      fetchTasks();
    } catch (error) {

      toast.error(`Erro ao excluir a tarefa: ${error.message}`)
    }
  };

  const handleEdit = (task) => {
    setTask(task.description);
    setPriority(task.priority);
    setEditingId(task.id);
  };

  const handleCancelEdit = () => {
    setTask('');
    setPriority('Baixa');
    setEditingId(null);
  };

  return (
    <div className="App">
      <h1>Lista de Tarefas</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Nova tarefa"
        />
        
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          {Object.keys(priorityLevels).map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
        
        <button type="submit">{editingId ? "Atualizar" : "Adicionar"}</button>

        {editingId && <button className="update-cancel-button" onClick={handleCancelEdit}>Cancelar edição</button>}
      </form>
      
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.description} (Prioridade: {task.priority})

            <div className="buttons">
              <button className="edit-button" onClick={() => handleEdit(task)}>Editar</button>
              
              <button className="delete-button" onClick={() => deleteTask(task.id)}>Deletar</button>
            </div>
          </li>
        ))}
      </ul>

      <ToastContainer
        limit={5}
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
    </div>
  );
}

export default App;