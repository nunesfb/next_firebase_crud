'use client';

import { ref, onValue, push, remove, update } from 'firebase/database';
import { db } from "../firebase/firebaseConfiguration";
import { useEffect, useState } from 'react';
import styles from './page.module.css';

interface ITask {
  name: string;
  status: boolean;
};

interface ITaskList {
  [key: string]: ITask;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<ITaskList>({});
  const [newTaskName, setNewTaskName] = useState<string>('')

  useEffect(() => {
    const fetchData = () => {
      const unsubscribe = onValue(ref(db, '/tasks'), (querySnapShot) => {
        const tasksData: ITaskList = querySnapShot.val() || {};
        console.log(tasksData);
        setTasks(tasksData);
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchData();
  }, []);

  const addNewTask = () => {
    push(ref(db, '/tasks'), { name: newTaskName, status: false });
    setNewTaskName('');
  };

  function clearTask(taskId: string) {
    const taskRef = ref(db, `/tasks/${taskId}`); 
    remove(taskRef);
  }

  function updateTasks(taskKey: string) {
    const taskRef = ref(db, `/tasks/${taskKey}`); 
    update(taskRef, { name: 'updated task', status: false});
  }

  return (
    <div className={styles.container}>
      <form className={styles.formContainer} onSubmit={(e) => {
        e.preventDefault();
        addNewTask();
      }}>
        <label className={styles.labelForm}>
          Task Name:
          <input
            type="text"
            className={styles.inputForm}
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Task name"
          />
        </label>
      </form>

      {
        loading ?
          (
            <h1 className={styles.title}>Loading... </h1>
          ) : (
            Object.keys(tasks).map((taskId) => (
              <div className={styles.tasksContainer} key={taskId}>
                <h1 className={styles.title}>{`ID: ${taskId}`}</h1>
                <p>{`Name: ${tasks[taskId].name}`}</p>
                <p>{`Status: ${tasks[taskId].status ? 'Finished' : 'In progress'}`}</p>
                <button className={styles.removeButton} onClick={ () => clearTask(taskId) }>Remove task</button>
              </div>
            ))
          )}
    </div>
  );
}