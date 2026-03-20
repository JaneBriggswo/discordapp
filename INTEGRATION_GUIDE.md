# Integração Pink Remote com Pink Bypass

## Arquitetura

```
┌─────────────────────┐
│  Pink Remote (Web)  │ <- http://localhost:3000
│    Next.js          │
└──────────┬──────────┘
           │ fetch('/api/bypass')
           │
┌──────────▼──────────┐
│ Node.js API Proxy   │ <- http://localhost:3000/api/bypass
│   (route.ts)        │
└──────────┬──────────┘
           │ fetch('http://localhost:9999')
           │
┌──────────▼──────────────┐
│ Pink Bypass.exe Server  │ <- http://localhost:9999
│   (Seu C++ expõe HTTP)  │
└─────────────────────────┘
```

## Como Funciona

1. **Site faz requisição** para `/api/bypass`
2. **Node.js proxy** encaminha para `localhost:9999`
3. **Pink Bypass.exe** executa o comando e retorna resultado
4. **Site recebe resposta** e atualiza UI

## Implementação no Pink Bypass.exe

Seu C++ precisa:

### 1. Iniciar um servidor HTTP na porta 9999

**Opções:**
- **cpp-httplib** (simples, recomendado)
- **Beast** (mais robusto, mais complexo)
- **Crow** (mais moderno)

### 2. Endpoints necessários

#### GET /api/status
Retorna status atual do bypass
```json
{
  "success": true,
  "data": {
    "bypass_version": "1.0.0",
    "process_running": true,
    "features": {
      "rage_aim": true,
      "legit_aim": false,
      "esp": true,
      "chams": false
    }
  }
}
```

#### POST /api/activate
Ativa uma função
```json
{
  "success": true,
  "data": {
    "feature": "rage_aim",
    "activated": true,
    "timestamp": 1234567890
  }
}
```

#### POST /api/deactivate
Desativa uma função

#### PUT /api/configure
Atualiza configurações
```json
{
  "success": true,
  "data": {
    "feature": "rage_aim",
    "config_updated": true
  }
}
```

#### GET /api/featurestatus?name=rage_aim
Status de um feature específico

## Exemplo em C++ usando cpp-httplib

```cpp
#include <httplib.h>
#include <json.hpp>

using json = nlohmann::json;

int main() {
    httplib::Server svr;

    // GET /api/status
    svr.Get("/api/status", [](const httplib::Request& req, httplib::Response& res) {
        json response;
        response["success"] = true;
        response["data"]["bypass_version"] = "1.0.0";
        response["data"]["process_running"] = true;
        response["data"]["features"]["rage_aim"] = g_config.rage_aim_enabled;
        response["data"]["features"]["esp"] = g_config.esp_enabled;
        
        res.set_content(response.dump(), "application/json");
    });

    // POST /api/activate
    svr.Post("/api/activate", [](const httplib::Request& req, httplib::Response& res) {
        json body = json::parse(req.body);
        std::string feature = body["params"]["feature"];
        
        json response;
        if (ActivateFeature(feature)) {
            response["success"] = true;
            response["data"]["activated"] = true;
        } else {
            response["success"] = false;
            response["error"] = "Failed to activate " + feature;
        }
        
        res.set_content(response.dump(), "application/json");
    });

    // Mais endpoints...

    svr.listen("127.0.0.1", 9999);
    return 0;
}
```

## Uso no Site

### 1. Ativar RAGE AIM

```typescript
const { activateFeature } = useBypass()

const handleLoadRageAim = async () => {
  try {
    await activateFeature('rage_aim', {
      fov: 90,
      smoothness: 50
    })
  } catch (error) {
    console.error('Falha:', error)
  }
}
```

### 2. Atualizar Configuração

```typescript
const { updateConfig } = useBypass()

const handleFOVChange = async (fov: number) => {
  await updateConfig('rage_aim', { fov })
}
```

### 3. Checar Conexão

```typescript
useEffect(() => {
  const checkBypass = async () => {
    const connected = await checkConnection()
    if (!connected) {
      addNotification({
        type: 'warning',
        title: 'Pink Bypass não está aberto',
        message: 'Abra Pink Bypass.exe para usar as funções'
      })
    }
  }
  checkBypass()
}, [])
```

## Próximos Passos

1. ✅ **Hook useBypass() criado** - site consegue chamar a API
2. ❌ **Adicionar HTTP server ao Pink Bypass.exe** - seu C++ precisa responder
3. ❌ **Mapear todos os comandos** - RAGE, LEGIT, ESP, CHAMS, etc
4. ❌ **Integrar no UI das categorias** - conectar botões do site com funções

## Checklist para Implementar

- [ ] Instalar cpp-httplib ou similar no Pink Bypass
- [ ] Criar servidor HTTP na porta 9999 em main.cpp
- [ ] Implementar endpoints GET /api/status, POST /api/activate, etc
- [ ] Documentar quais parâmetros cada feature aceita
- [ ] Testar comunicação: curl http://localhost:9999/api/status
- [ ] Integrar useBypass() nos componentes do site
- [ ] Testar ativar/desativar funções via site

## Segurança

⚠️ **IMPORTANTE**: O servidor HTTP só escuta em `127.0.0.1:9999` (localhost). Isso previne acesso externo.

Se quiser acessar de outra máquina:
```cpp
svr.listen("0.0.0.0", 9999); // Cuidado: expõe para rede inteira
```

## Troubleshooting

**"Pink Bypass não está conectado"**
- Pink Bypass.exe não está rodando
- Servidor HTTP não iniciou
- Porta 9999 está em uso por outro programa

**"Failed to communicate"**
- Firewall bloqueando localhost:9999
- Pink Bypass travou

Verifique com:
```powershell
Test-NetConnection localhost -Port 9999
```
