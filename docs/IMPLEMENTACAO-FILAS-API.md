# 🚀 Implementação da API de Filas do Usuário

## 📋 Visão Geral

Este documento descreve como implementar o endpoint `/clients/my-queues` na API fila-api para suportar a nova funcionalidade de listar as filas que o usuário está participando.

## 🔗 Endpoint Necessário

### **GET /api/v1/clients/my-queues**

**Descrição:** Retorna todas as filas e tickets do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Resposta de Sucesso (200):**
```json
{
  "client": {
    "identifier": "123456789",
    "name": "GABRIEL",
    "phone": "11999999999",
    "email": "gabriel@example.com",
    "userType": "dependent"
  },
  "queues": [
    {
      "id": "queue-1",
      "name": "Fila de Exames",
      "description": "Fila para realização de exames médicos",
      "tenant": {
        "id": "tenant-1",
        "name": "CLINICA E LABORATORI",
        "slug": "clinica-lab"
      },
      "tickets": [
        {
          "id": "ticket-1",
          "number": 455888294,
          "status": "validated",
          "createdAt": "2025-01-10T21:06:00Z",
          "validatedAt": "2025-06-19T10:00:00Z",
          "token": "EX2025011021060"
        }
      ]
    }
  ]
}
```

## 🏗️ Estrutura da Resposta

### **Client Object**
- `identifier`: Identificador único do cliente (CPF, telefone, etc.)
- `name`: Nome do cliente
- `phone`: Telefone do cliente
- `email`: Email do cliente
- `userType`: Tipo de usuário (`titular` ou `dependent`)

### **Queue Object**
- `id`: ID único da fila
- `name`: Nome da fila
- `description`: Descrição opcional da fila
- `tenant`: Informações do estabelecimento

### **Ticket Object**
- `id`: ID único do ticket
- `number`: Número do pedido
- `status`: Status atual do ticket
- `createdAt`: Data de criação
- `validatedAt`: Data de validação (opcional)
- `token`: Token/senha do ticket

## 🔐 Autenticação

O endpoint deve verificar:
1. **Token JWT válido** no header Authorization
2. **Cliente autenticado** existe no sistema
3. **Permissões** para acessar os dados

## 📊 Lógica de Negócio

### **1. Buscar Cliente**
```typescript
// Extrair identificador do token JWT
const clientIdentifier = jwt.decode(token).sub;

// Buscar cliente no banco
const client = await ClientRepository.findByIdentifier(clientIdentifier);
```

### **2. Buscar Filas Ativas**
```typescript
// Buscar todas as filas onde o cliente tem tickets ativos
const activeQueues = await QueueRepository.findActiveByClient(client.id);
```

### **3. Buscar Tickets**
```typescript
// Para cada fila, buscar tickets do cliente
const tickets = await TicketRepository.findByClientAndQueue(client.id, queue.id);
```

### **4. Agrupar Dados**
```typescript
// Organizar dados no formato esperado pelo frontend
const response = {
  client: {
    identifier: client.identifier,
    name: client.name,
    phone: client.phone,
    email: client.email,
    userType: client.userType
  },
  queues: activeQueues.map(queue => ({
    id: queue.id,
    name: queue.name,
    description: queue.description,
    tenant: {
      id: queue.tenant.id,
      name: queue.tenant.name,
      slug: queue.tenant.slug
    },
    tickets: tickets.filter(t => t.queueId === queue.id)
  }))
};
```

## 🗄️ Queries SQL Sugeridas

### **Buscar Filas Ativas do Cliente**
```sql
SELECT DISTINCT 
  q.id, q.name, q.description,
  t.id as tenant_id, t.name as tenant_name, t.slug as tenant_slug
FROM queues q
JOIN tenants t ON q.tenant_id = t.id
JOIN tickets tk ON q.id = tk.queue_id
WHERE tk.client_id = :clientId
  AND q.is_active = true
  AND tk.status IN ('WAITING', 'CALLED', 'COMPLETED')
ORDER BY q.name;
```

### **Buscar Tickets do Cliente por Fila**
```sql
SELECT 
  tk.id, tk.number, tk.status, tk.created_at, tk.validated_at,
  CONCAT('EX', DATE_FORMAT(tk.created_at, '%Y%m%d'), 
         TIME_FORMAT(tk.created_at, '%H%i%s')) as token
FROM tickets tk
WHERE tk.client_id = :clientId
  AND tk.queue_id = :queueId
  AND tk.status IN ('WAITING', 'CALLED', 'COMPLETED')
ORDER BY tk.created_at DESC;
```

## 🧪 Testes

### **Cenários de Teste**
1. **Cliente com múltiplas filas**
2. **Cliente sem filas ativas**
3. **Token inválido/expirado**
4. **Cliente inexistente**
5. **Erro de banco de dados**

### **Exemplo de Teste**
```typescript
describe('GET /clients/my-queues', () => {
  it('should return user queues for authenticated client', async () => {
    const response = await request(app)
      .get('/api/v1/clients/my-queues')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('client');
    expect(response.body).toHaveProperty('queues');
    expect(Array.isArray(response.body.queues)).toBe(true);
  });
});
```

## 🚀 Próximos Passos

1. **Implementar endpoint** na API fila-api
2. **Criar testes** para validar funcionalidade
3. **Atualizar documentação** da API
4. **Testar integração** com o app mobile
5. **Remover dados mock** do frontend

## 📱 Integração com App Mobile

Após implementar o endpoint:
1. Remover import do `mockUserQueues`
2. Descomentar código real na função `loadUserQueues`
3. Testar com dados reais da API
4. Validar interface e funcionalidades
