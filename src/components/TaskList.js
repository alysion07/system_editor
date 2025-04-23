import React, { useState } from 'react';
import './TaskList.css';

const TaskList = () => {
  // 샘플 초기 데이터
  const initialTasks = [
    { id: 1, title: '리액트 컴포넌트 생성하기', completed: true },
    { id: 2, title: '웹팩 설정하기', completed: true },
    { id: 3, title: '프로토버퍼 파일 통합하기', completed: false },
    { id: 4, title: '서비스 래퍼 구현하기', completed: false }
  ];

  // 상태 관리
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // 새 태스크 추가 함수
  const addTask = () => {
    if (newTaskTitle.trim() === '') return;
    
    const newTask = {
      id: tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1,
      title: newTaskTitle,
      completed: false
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  // 태스크 상태 토글 함수
  const toggleTaskStatus = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed } 
        : task
    ));
  };

  // 태스크 삭제 함수
  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <div className="task-list-container">
      <h2>태스크 목록</h2>
      
      {/* 새 태스크 입력 폼 */}
      <div className="task-form">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="새 태스크 입력"
        />
        <button onClick={addTask}>추가</button>
      </div>
      
      {/* 태스크 목록 */}
      <ul className="tasks">
        {tasks.length === 0 ? (
          <li className="no-tasks">등록된 태스크가 없습니다</li>
        ) : (
          tasks.map(task => (
            <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <div className="task-content">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskStatus(task.id)}
                />
                <span className="task-title">{task.title}</span>
              </div>
              <button 
                className="delete-btn"
                onClick={() => deleteTask(task.id)}
              >
                삭제
              </button>
            </li>
          ))
        )}
      </ul>
      
      {/* 상태 요약 */}
      <div className="task-stats">
        <p>전체: {tasks.length}개 / 완료: {tasks.filter(task => task.completed).length}개</p>
      </div>
    </div>
  );
};

export default TaskList;
