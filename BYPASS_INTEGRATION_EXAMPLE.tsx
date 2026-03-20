/**
 * Exemplo de integração Pink Bypass no componente AIM
 * 
 * Este arquivo mostra como conectar o botão "LOAD" do site
 * com o Pink Bypass.exe rodando localmente
 * 
 * Para usar:
 * 1. Adicione useBypass() ao seu componente
 * 2. Chame activateFeature() quando clicar em LOAD
 * 3. Chame deactivateFeature() quando desativar
 */

import { useBypass } from '@/hooks/useBypass'
import { useAppContext } from '@/contexts/app-context'

// Dentro do seu componente AimCategory:

export function AimCategoryWithBypass() {
  const { activateFeature, deactivateFeature, updateConfig, isLoading } = useBypass()
  const { state, updateAim } = useAppContext()

  /**
   * Quando user clica em "LOAD RAGE AIM"
   */
  const handleLoadRageAim = async () => {
    try {
      // 1. Avisa o Pink Bypass para ativar RAGE AIM
      const result = await activateFeature('rage_aim', {
        fov: 90,
        smoothness: 50,
        delay: 10
      })

      // 2. Atualiza o estado local do site
      updateAim('rage', 'enabled', true)

      console.log('RAGE AIM ativado:', result)
    } catch (error) {
      console.error('Erro ao ativar RAGE AIM:', error)
    }
  }

  /**
   * Quando user desativa via checkbox
   */
  const handleDisableRageAim = async () => {
    try {
      await deactivateFeature('rage_aim')
      updateAim('rage', 'enabled', false)
    } catch (error) {
      console.error('Erro ao desativar:', error)
    }
  }

  /**
   * Quando user muda FOV (slider/input)
   */
  const handleFOVChange = async (newFOV: number) => {
    try {
      await updateConfig('rage_aim', {
        fov: newFOV,
        smoothness: state.aim.rage.smoothness
      })
    } catch (error) {
      console.error('Erro ao atualizar FOV:', error)
    }
  }

  return (
    <>
      {/* Botão LOAD que chama Pink Bypass */}
      <Button
        onClick={handleLoadRageAim}
        loading={isLoading}
        disabled={isLoading}
      >
        LOAD
      </Button>

      {/* Checkbox para desativar */}
      <Checkbox
        label="ENABLED"
        checked={state.aim.rage.enabled}
        onChange={(e) => {
          if (e.target.checked) {
            handleLoadRageAim()
          } else {
            handleDisableRageAim()
          }
        }}
      />
    </>
  )
}

/**
 * Fluxo completo:
 * 
 * User clica LOAD
 *   ↓
 * Site chama: activateFeature('rage_aim', config)
 *   ↓
 * API proxy em /api/bypass envia para localhost:9999
 *   ↓
 * Pink Bypass.exe recebe POST /api/activate
 *   ↓
 * Pink Bypass executa: ActivateRageAim(config)
 *   ↓
 * Pink Bypass retorna: { success: true }
 *   ↓
 * Site atualiza estado e mostra notificação
 *   ↓
 * RAGE AIM está ativo no jogo!
 */
