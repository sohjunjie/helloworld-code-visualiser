import { Injectable } from '@angular/core';
import { DemoProject, AnalysisResult } from '../models/code-visualizer.models';

@Injectable({
  providedIn: 'root',
})
export class ExportDemoService {
  getDemoProjects(): DemoProject[] {
    return [
      {
        id: 'express-api',
        name: 'Express REST API Server',
        description: 'Node.js Express backend with controllers, services, database models, and routes.',
        fileCount: 7,
        files: {
          'src/index.ts': {
            content: `import express from 'express';\nimport { userRouter } from './routes/user.routes';\nimport { authMiddleware } from './middleware/auth.middleware';\nimport { connectDatabase } from './services/db.service';\n\nconst app = express();\nconnectDatabase();\napp.use('/api/users', authMiddleware, userRouter);\napp.listen(3000);`,
          },
          'src/routes/user.routes.ts': {
            content: `import { Router } from 'express';\nimport { getUser, createUser } from '../controllers/user.controller';\n\nexport const userRouter = Router();\nuserRouter.get('/:id', getUser);\nuserRouter.post('/', createUser);`,
          },
          'src/controllers/user.controller.ts': {
            content: `import { UserService } from '../services/user.service';\n\nconst userService = new UserService();\nexport const getUser = async (req, res) => {\n  const user = await userService.findUserById(req.params.id);\n  res.json(user);\n};\nexport const createUser = async (req, res) => {\n  const user = await userService.createUser(req.body);\n  res.json(user);\n};`,
          },
          'src/services/user.service.ts': {
            content: `import { UserModel } from '../models/user.model';\nimport { Logger } from '../utils/logger';\n\nexport class UserService {\n  async findUserById(id: string) {\n    Logger.info('Fetching user', id);\n    return UserModel.findById(id);\n  }\n  async createUser(data: any) {\n    return UserModel.create(data);\n  }\n}`,
          },
          'src/services/db.service.ts': {
            content: `import { Logger } from '../utils/logger';\n\nexport const connectDatabase = () => {\n  Logger.info('Database connected successfully');\n};`,
          },
          'src/models/user.model.ts': {
            content: `export interface User {\n  id: string;\n  name: string;\n  email: string;\n}\n\nexport const UserModel = {\n  findById: (id: string) => ({ id, name: 'Alice', email: 'alice@example.com' }),\n  create: (data: any) => ({ id: '123', ...data }),\n};`,
          },
          'src/middleware/auth.middleware.ts': {
            content: `import { Logger } from '../utils/logger';\n\nexport const authMiddleware = (req: any, res: any, next: any) => {\n  Logger.info('Authenticating request');\n  next();\n};`,
          },
          'src/utils/logger.ts': {
            content: `export class Logger {\n  static info(...args: any[]) {\n    console.log('[INFO]', ...args);\n  }\n}`,
          },
        },
      },
      {
        id: 'react-dashboard',
        name: 'React Analytics App',
        description: 'React TypeScript frontend with components, custom hooks, context, and UI elements.',
        fileCount: 6,
        files: {
          'src/App.tsx': {
            content: `import React from 'react';\nimport { Header } from './components/Header';\nimport { Dashboard } from './components/Dashboard';\nimport { AuthProvider } from './context/AuthContext';\n\nexport const App = () => (\n  <AuthProvider>\n    <Header />\n    <Dashboard />\n  </AuthProvider>\n);`,
          },
          'src/components/Header.tsx': {
            content: `import React from 'react';\nimport { useAuth } from '../context/AuthContext';\nimport { Button } from './ui/Button';\n\nexport const Header = () => {\n  const { user, logout } = useAuth();\n  return <header><span>{user?.name}</span><Button onClick={logout}>Logout</Button></header>;\n};`,
          },
          'src/components/Dashboard.tsx': {
            content: `import React from 'react';\nimport { ChartCard } from './ChartCard';\nimport { useAnalytics } from '../hooks/useAnalytics';\n\nexport const Dashboard = () => {\n  const { data } = useAnalytics();\n  return <main><ChartCard data={data} /></main>;\n};`,
          },
          'src/components/ChartCard.tsx': {
            content: `import React from 'react';\nimport { Card } from './ui/Card';\n\nexport const ChartCard = ({ data }: { data: any }) => (\n  <Card title="Metrics"><div>{JSON.stringify(data)}</div></Card>\n);`,
          },
          'src/components/ui/Button.tsx': {
            content: `import React from 'react';\nexport const Button = ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>;`,
          },
          'src/components/ui/Card.tsx': {
            content: `import React from 'react';\nexport const Card = ({ title, children }: any) => <div><h3>{title}</h3>{children}</div>;`,
          },
          'src/context/AuthContext.tsx': {
            content: `import React, { createContext, useContext, useState } from 'react';\nconst AuthContext = createContext<any>(null);\nexport const AuthProvider = ({ children }: any) => {\n  const [user, setUser] = useState({ name: 'Bob' });\n  return <AuthContext.Provider value={{ user, logout: () => setUser(null) }}>{children}</AuthContext.Provider>;\n};\nexport const useAuth = () => useContext(AuthContext);`,
          },
          'src/hooks/useAnalytics.ts': {
            content: `import { useState, useEffect } from 'react';\nexport const useAnalytics = () => {\n  const [data] = useState({ visitors: 1040, sales: 320 });\n  return { data };\n};`,
          },
        },
      },
      {
        id: 'ts-utility-lib',
        name: 'TypeScript Core Library',
        description: 'Algorithmic utility library with graph solvers, pathfinders, and data structures.',
        fileCount: 5,
        files: {
          'src/index.ts': {
            content: `export * from './graph/dijkstra';\nexport * from './graph/tarjan';\nexport * from './structures/queue';\nexport * from './structures/stack';`,
          },
          'src/graph/dijkstra.ts': {
            content: `import { PriorityQueue } from '../structures/queue';\n\nexport function dijkstra(graph: any, start: string) {\n  const queue = new PriorityQueue();\n  queue.enqueue(start, 0);\n  return queue;\n}`,
          },
          'src/graph/tarjan.ts': {
            content: `import { Stack } from '../structures/stack';\n\nexport function tarjan(nodes: string[]) {\n  const stack = new Stack();\n  return stack;\n}`,
          },
          'src/structures/queue.ts': {
            content: `export class PriorityQueue {\n  private items: any[] = [];\n  enqueue(element: any, priority: number) {\n    this.items.push({ element, priority });\n  }\n}`,
          },
          'src/structures/stack.ts': {
            content: `export class Stack<T> {\n  private items: T[] = [];\n  push(item: T) { this.items.push(item); }\n  pop(): T | undefined { return this.items.pop(); }\n}`,
          },
        },
      },
    ];
  }

  downloadJSON(result: AnalysisResult) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${result.projectName || 'code-analysis'}-report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  downloadCanvasPNG(canvas: HTMLCanvasElement, filename = 'code-visualization.png') {
    const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const link = document.createElement('a');
    link.download = filename;
    link.href = image;
    link.click();
  }
}
