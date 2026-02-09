// Pixel Art Virtual Office v2.0 - Main Component
import { useCallback, useRef, useState } from 'react';
import { usePixiApp } from './hooks/usePixiApp';
import { useChatBubbles } from './hooks/useChatBubbles';
import { useTileMap } from './hooks/useTileMap';
import { TileMapLayer } from './pixi/TileMapLayer';
import { AgentSpriteManager } from './pixi/AgentSpriteManager';
import { useVirtualOfficeStore } from '../virtual-office/store/virtualOfficeStore';
import type { AgentId, AgentStatus } from './types';

interface PixelArtOfficeProps {
  width?: number;
  height?: number;
}

export function PixelArtOffice({ width = 1200, height = 800 }: PixelArtOfficeProps) {
  const {
    canvasRef,
    app,
    mainContainer,
    agentsContainer,
    isReady,
    fps,
    panTo,
    zoomTo,
    resetCamera,
  } = usePixiApp({ width, height, skipPlaceholders: true });

  // Store state
  const selectedAgentId = useVirtualOfficeStore((state) => state.selectedAgentId);
  const selectedAgent = useVirtualOfficeStore((state) =>
    state.selectedAgentId ? state.agents[state.selectedAgentId] : null
  );
  const selectAgent = useVirtualOfficeStore((state) => state.selectAgent);
  const setAgentStatus = useVirtualOfficeStore((state) => state.setAgentStatus);

  // Chat bubbles
  const { showBubble, updateAgentPosition } = useChatBubbles({
    parentContainer: agentsContainer,
  });

  // Get spawn points for bubble positioning
  const { getSpawnPoint } = useTileMap();

  // Change agent status for animation testing
  const handleStatusChange = useCallback((status: AgentStatus) => {
    if (selectedAgentId) {
      setAgentStatus(selectedAgentId, status, status === 'working' ? 'Coding feature...' : undefined);

      // Update bubble position and show status bubble
      const spawn = getSpawnPoint(selectedAgentId);
      if (spawn) {
        updateAgentPosition(selectedAgentId, spawn.x, spawn.y);
        showBubble({
          agentId: selectedAgentId,
          message: status === 'working' ? 'On it!' : status === 'thinking' ? 'Hmm...' : status === 'waiting' ? 'Ready!' : 'Chillin\'',
          type: status === 'working' ? 'success' : status === 'thinking' ? 'thinking' : 'info',
          duration: 3000,
        });
      }
    }
  }, [selectedAgentId, setAgentStatus, getSpawnPoint, updateAgentPosition, showBubble]);

  // Send custom message
  const [customMessage, setCustomMessage] = useState('');

  const handleSendMessage = useCallback(() => {
    if (selectedAgentId && customMessage.trim()) {
      const spawn = getSpawnPoint(selectedAgentId);
      if (spawn) {
        updateAgentPosition(selectedAgentId, spawn.x, spawn.y);
        showBubble({
          agentId: selectedAgentId,
          message: customMessage.trim(),
          type: 'info',
          duration: 5000,
        });
      }
      setCustomMessage('');
    }
  }, [selectedAgentId, customMessage, getSpawnPoint, updateAgentPosition, showBubble]);

  // Drag state
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Handle agent click
  const handleAgentClick = useCallback((agentId: AgentId) => {
    selectAgent(agentId);
  }, [selectAgent]);

  // Mouse handlers for pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grabbing';
    }
  }, [canvasRef]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !mainContainer) return;

    const deltaX = e.clientX - lastPos.current.x;
    const deltaY = e.clientY - lastPos.current.y;

    mainContainer.x += deltaX;
    mainContainer.y += deltaY;

    setPosition({ x: mainContainer.x, y: mainContainer.y });
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, [mainContainer]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grab';
    }
  }, [canvasRef]);

  // Wheel handler for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (!mainContainer) return;

    const delta = -Math.sign(e.deltaY) * 0.1;
    const newZoom = Math.max(0.5, Math.min(2, zoom + delta));

    mainContainer.scale.set(newZoom);
    setZoom(newZoom);
  }, [mainContainer, zoom]);

  // Reset camera on double click
  const handleDoubleClick = useCallback(() => {
    resetCamera();
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [resetCamera]);

  // Close panel when clicking outside
  const handleClosePanel = useCallback(() => {
    selectAgent(null);
  }, [selectAgent]);

  return (
    <div className="pixel-art-office h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <header className="flex-shrink-0 p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🏢</span>
              Pixel Art Virtual Office
              <span className="text-sm font-normal text-green-500 bg-green-500/10 px-2 py-1 rounded">
                v2.0
              </span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Pixi.js WebGL • Drag to pan, scroll to zoom, double-click to reset • Click agent for details
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Zoom indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <button
                onClick={() => {
                  const newZoom = Math.max(0.5, zoom - 0.1);
                  mainContainer?.scale.set(newZoom);
                  setZoom(newZoom);
                }}
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
              >
                -
              </button>
              <span className="text-xs text-gray-400 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => {
                  const newZoom = Math.min(2, zoom + 0.1);
                  mainContainer?.scale.set(newZoom);
                  setZoom(newZoom);
                }}
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
              >
                +
              </button>
            </div>

            {/* FPS */}
            <div className="px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <span className={`text-xs font-mono ${fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                {fps} FPS
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700/50">
              <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
              <span className="text-xs text-gray-400">
                {isReady ? 'WebGL Ready' : 'Initializing...'}
              </span>
            </div>

            {/* Reset button */}
            <button
              onClick={handleDoubleClick}
              className="px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors text-xs"
            >
              Reset View
            </button>
          </div>
        </div>
      </header>

      {/* Canvas Container */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{ cursor: 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
        />

        {/* Pixi Components (rendered via hooks) */}
        {isReady && mainContainer && (
          <>
            <TileMapLayer parentContainer={mainContainer} />
            <AgentSpriteManager
              app={app}
              parentContainer={agentsContainer}
              onAgentClick={handleAgentClick}
            />
          </>
        )}

        {/* Loading overlay */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400">Initializing Pixi.js WebGL...</p>
            </div>
          </div>
        )}

        {/* Agent Panel */}
        {selectedAgent && (
          <div className="absolute top-4 right-4 w-72 p-4 rounded-xl bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 shadow-xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedAgent.name}</h3>
                <p className="text-sm text-gray-400">{selectedAgent.role}</p>
              </div>
              <button
                onClick={handleClosePanel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${
                selectedAgent.status === 'working' ? 'bg-green-500' :
                selectedAgent.status === 'thinking' ? 'bg-yellow-500' :
                selectedAgent.status === 'waiting' ? 'bg-blue-500' :
                'bg-gray-500'
              }`} />
              <span className="text-sm text-gray-300 capitalize">{selectedAgent.status}</span>
            </div>

            {/* Current Activity */}
            {selectedAgent.currentActivity && (
              <div className="p-3 rounded-lg bg-gray-800/50 mb-3">
                <p className="text-xs text-gray-400 mb-1">Current Activity</p>
                <p className="text-sm text-white">{selectedAgent.currentActivity}</p>
              </div>
            )}

            {/* Animation Test Controls */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2">Test Animations</p>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => handleStatusChange('idle')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedAgent.status === 'idle'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Idle
                </button>
                <button
                  onClick={() => handleStatusChange('working')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedAgent.status === 'working'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Working
                </button>
                <button
                  onClick={() => handleStatusChange('thinking')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedAgent.status === 'thinking'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Thinking
                </button>
                <button
                  onClick={() => handleStatusChange('waiting')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedAgent.status === 'waiting'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Waiting
                </button>
              </div>
            </div>

            {/* Send Message */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2">Send Chat Bubble</p>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type message..."
                  className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!customMessage.trim()}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Department */}
            <div className="text-xs text-gray-500">
              Department: <span className="text-gray-400 capitalize">{selectedAgent.department}</span>
            </div>
          </div>
        )}

        {/* Info panel */}
        <div className="absolute bottom-4 left-4 p-4 rounded-xl bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 text-xs text-gray-400 space-y-1">
          <div className="text-white font-semibold mb-2">Sprint 4 - Chat Bubbles</div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Pixi.js + WebGL
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span> TileMap + Agents
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Animations (idle, work, think)
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Chat bubbles overlay
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Agent panel + controls
          </div>
          <div className="flex items-center gap-2 text-yellow-400">
            <span>○</span> Next: Polish (Sprint 5)
          </div>
        </div>

        {/* Coordinates */}
        <div className="absolute bottom-4 right-4 px-3 py-2 rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 text-xs font-mono text-gray-500">
          pos: ({Math.round(position.x)}, {Math.round(position.y)}) | zoom: {zoom.toFixed(1)}x
        </div>
      </div>
    </div>
  );
}

export default PixelArtOffice;
