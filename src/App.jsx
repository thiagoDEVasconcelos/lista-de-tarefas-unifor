import { useState, useEffect } from "react";
import Parse from "parse";
import "./App.css";

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
    query.ascending("priority");
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
      console.log('Tarefa criada com sucesso!');
      fetchTasks();
    } catch (error) {
      console.log('Erro ao criar a tarefa: ' + error.message);
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
      fetchTasks();
    } catch (error) {
      console.error("Erro ao atualizar a tarefa:", error);
    }
  };
  
  const deleteTask = async (id) => {
    const Task = Parse.Object.extend("Task");
    const query = new Parse.Query(Task);
    const task = await query.get(id);
    await task.destroy();
    fetchTasks();
  };

  const handleEdit = (task) => {
    setTask(task.description);
    setPriority(task.priority);
    setEditingId(task.id);
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
      </form>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.description} (Prioridade: {t.priority})
            <div className="buttons">
              <button className="edit-button" onClick={() => handleEdit(t)}>Editar</button>
              <button className="delete-button" onClick={() => deleteTask(t.id)}>Deletar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;