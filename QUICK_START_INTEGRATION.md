# 🚀 Guia Rápido: Conectar Pink Remote com Pink Bypass

## 📋 O que foi criado?

### **Site (Pink Remote)**
- ✅ API Proxy em `/app/api/bypass/route.ts`
- ✅ Hook `useBypass()` em `/hooks/useBypass.ts`
- ✅ Config JSON em `/public/bypass-config.json`

### **Executor (Pink Bypass.exe)**
- ✅ Template HTTP Server em `/includes/server/BypassHTTPServer.hpp`
- ✅ Exemplo de uso em `/MAIN_CPP_EXAMPLE.cpp`

---

## 🔧 Passo-a-Passo de Implementação

### **PASSO 1: Adicionar HTTP Library ao Pink Bypass**

1. Download: https://github.com/yhirose/cpp-httplib
2. Baixe `httplib.h`
3. Coloque em: `LoaderBaseDX11/includes/httplib.h`

### **PASSO 2: Integrar BypassHTTPServer no seu Code**

Em seu `main.cpp` ou `DllMain`:

```cpp
#include "server/BypassHTTPServer.hpp"

// Global
BypassHTTPServer g_server;

// Na inicialização
void Setup() {
    // ... seu código ...
    g_server.start();  // Inicia servidor HTTP
}

// Na finalização
void Cleanup() {
    g_server.stop();
    // ... seu código ...
}
```

### **PASSO 3: Implementar os Features**

No `BypassHTTPServer.hpp`, substitua os TODOs:

```cpp
if (feature == "rage_aim") {
    // Chame sua função de RAGE AIM
    ActivateRageAim(config);  // Sua função existente
    response["success"] = true;
}
```

### **PASSO 4: Testar a Conexão**

Abra PowerShell e teste:
```powershell
curl http://127.0.0.1:9999/api/status
```

Você deve receber:
```json
{
  "success": true,
  "data": {
    "bypass_version": "1.0.0",
    "features": { "rage_aim": false, ... }
  }
}
```

### **PASSO 5: Integrar no Site**

Em seus componentes (`aim-category.tsx`, `visuals-category.tsx`):

```typescript
import { useBypass } from '@/hooks/useBypass'

export function AimCategory() {
  const { activateFeature, deactivateFeature, isLoading } = useBypass()

  const handleLoad = async () => {
    await activateFeature('rage_aim', {
      fov: 90,
      smoothness: 50,
      delay: 10
    })
  }

  return (
    <Button onClick={handleLoad} loading={isLoading}>
      LOAD
    </Button>
  )
}
```

---

## 🎯 Fluxo Completo

```
User clica LOAD no site
        ↓
Site envia: POST http://localhost:3000/api/bypass
        ↓
API proxy envia para: POST http://localhost:9999/api/activate
        ↓
Pink Bypass.exe recebe e executa
        ↓
Pink Bypass retorna status
        ↓
Site mostra notificação e atualiza UI
        ↓
Feature está ATIVA NO JOGO! 🎉
```

---

## 📂 Arquivos para Mexer

### Na pasta **Pink Remote**:
- `app/api/bypass/route.ts` ← Proxy (JÁ CRIADO)
- `hooks/useBypass.ts` ← Hook (JÁ CRIADO)
- `components/categories/aim-category.tsx` ← Integrar useBypass()
- `components/categories/visuals-category.tsx` ← Integrar useBypass()
- `components/categories/settings-category.tsx` ← Integrar useBypass()

### Na pasta **Pink Bypass (C++)**:
- `includes/server/BypassHTTPServer.hpp` ← HTTP Server (JÁ CRIADO)
- `main.cpp` ← Chamar g_server.start() na inicialização
- Seus arquivos de features (RAGE, ESP, etc) ← Implementar os TODOs

---

## 🧪 Checklist

- [ ] Baixar cpp-httplib
- [ ] Adicionar `BypassHTTPServer.hpp` ao projeto
- [ ] Integrar em `main.cpp`
- [ ] Implementar os features (RAGE, LEGIT, ESP, CHAMS)
- [ ] Testar: `curl http://127.0.0.1:9999/api/status`
- [ ] Integrar `useBypass()` nos componentes do site
- [ ] Testar end-to-end: clicar LOAD no site → ativa no bypass

---

## ⚡ Dica Rápida

Se o site diz "Pink Bypass não está conectado", verifique:
1. Pink Bypass.exe está rodando?
2. Servidor HTTP iniciou? (procure por `[BypassHTTPServer] Started`)
3. Porta 9999 não está bloqueada?

```powershell
# Testar porta
Test-NetConnection localhost -Port 9999
```

---

## 📞 Próximas Etapas

1. ✅ Infraestrutura de comunicação: **PRONTA**
2. ❌ Adicionar HTTP library: **VOCÊ FAZ AGORA**
3. ❌ Mapear features: **VOCÊ FAZ DEPOIS**
4. ❌ Integrar no site: **VOCÊ FAZ DEPOIS**

Quer ajuda em algum passo específico?
