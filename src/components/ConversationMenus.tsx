import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import {
  CopyIcon,
  ExportIcon,
  HTMLFileIcon,
  JSONFileIcon,
  LinkIcon,
  MarkdownIcon,
  SegmentedExportIcon,
  TXTFileIcon,
} from "~components/icons"
import { DeleteIcon } from "~components/icons/DeleteIcon"
import { FolderMoveIcon } from "~components/icons/FolderMoveIcon"
import { PinIcon } from "~components/icons/PinIcon"
import { RenameIcon } from "~components/icons/RenameIcon"
import { TagIcon } from "~components/icons/TagIcon"
import type { Conversation, Folder } from "~core/conversation-manager"
import { OPHEL_HOVER_WIDTH_RETAIN_LAYER_PROPS } from "~utils/dom-toolkit"
import { t } from "~utils/i18n"

// ==================== 菜单样式  ====================

// 菜单样式由 src/style.css 中的 .gh-menu-* 类提供（与工具箱 quick-menu 同一套设计语言）。
// 面板样式经 getStyle() 注入 Shadow DOM，但菜单通过 Portal 渲染到 document.body，
// 因此仍需要在这里把样式注入主文档，保证菜单在所有宿主页面上可用。
const MENU_STYLES = `
  .gh-menu {
    background: var(--gh-bg, #ffffff);
    border: 1px solid var(--gh-border, #e5e7eb);
    border-radius: 12px;
    box-shadow: var(--gh-shadow, 0 6px 16px rgba(0, 0, 0, 0.1));
    padding: 6px;
    min-width: 160px;
  }
  .gh-menu-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 7px 10px;
    border: none;
    background: transparent;
    text-align: left;
    font-size: 13px;
    font-family: inherit;
    color: var(--gh-text, #111827);
    cursor: pointer;
    border-radius: 8px;
    white-space: nowrap;
    transition: background 0.2s ease, color 0.2s ease;
  }
  .gh-menu-btn:hover {
    background: color-mix(in srgb, var(--gh-text) 6%, transparent);
  }
  .gh-menu-btn:focus-visible {
    outline: 2px solid var(--gh-primary, #10b981);
    outline-offset: -2px;
  }
  .gh-menu-btn.danger {
    color: var(--gh-text-danger, #ef4444);
  }
  .gh-menu-btn svg {
    display: block;
    flex-shrink: 0;
  }
  .gh-menu-divider {
    height: 1px;
    margin: 4px 6px;
    background: var(--gh-border, #e5e7eb);
  }
`

let menuStyleInjected = false

const injectMenuStyles = () => {
  if (menuStyleInjected) return
  const style = document.createElement("style")
  style.id = "gh-menu-styles"
  style.textContent = MENU_STYLES
  document.head.appendChild(style)
  menuStyleInjected = true
}

// ==================== 通用菜单容器 ====================

interface MenuProps {
  anchorEl: HTMLElement | null
  anchorPoint?: MenuAnchorPoint
  onClose: () => void
  children: React.ReactNode
}

export interface MenuAnchorPoint {
  left: number
  top: number
}

/**
 * 上下文菜单 - 使用 Portal 渲染到 document.body
 * 这样避免被 MainPanel 的 transform 影响 fixed 定位
 */
export const ContextMenu: React.FC<MenuProps> = ({ anchorEl, anchorPoint, onClose, children }) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(null)

  useEffect(() => {
    // 注入菜单样式
    injectMenuStyles()

    if (!anchorEl && !anchorPoint) return

    const handleClickOutside = (e: MouseEvent) => {
      // 使用 composedPath 获取完整的事件路径（穿透 Shadow DOM）
      const path = e.composedPath()
      const clickedInMenu = menuRef.current && path.includes(menuRef.current)
      const clickedOnAnchor = anchorEl ? path.includes(anchorEl) : false

      if (!clickedInMenu && !clickedOnAnchor) {
        onClose()
      }
    }

    // 延迟添加监听，避免立即触发
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside, true) // 使用捕获阶段
    }, 0)

    return () => {
      clearTimeout(timer)
      document.removeEventListener("click", handleClickOutside, true)
    }
  }, [anchorEl, anchorPoint, onClose])

  // 计算菜单位置，确保不超出屏幕边界
  useEffect(() => {
    if ((!anchorEl && !anchorPoint) || !menuRef.current) return

    const menuRect = menuRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const menuWidth = menuRect.width || 150 // 默认菜单宽度
    const menuHeight = menuRect.height || 200 // 默认菜单高度

    let left = anchorPoint?.left ?? 10
    let top = anchorPoint?.top ?? 10

    if (!anchorPoint && anchorEl) {
      const rect = anchorEl.getBoundingClientRect()
      left = rect.left
      top = rect.bottom + 4
    }

    // 检测是否超出右边界，如果超出则向左展开
    if (left + menuWidth > viewportWidth - 10) {
      if (anchorPoint) {
        left = viewportWidth - menuWidth - 10
      } else if (anchorEl) {
        const rect = anchorEl.getBoundingClientRect()
        left = rect.right - menuWidth
      }
    }

    // 检测是否超出左边界
    if (left < 10) {
      left = 10
    }

    // 检测是否超出下边界，如果超出则向上展开
    if (top + menuHeight > viewportHeight - 10) {
      if (anchorPoint) {
        top = viewportHeight - menuHeight - 10
      } else if (anchorEl) {
        const rect = anchorEl.getBoundingClientRect()
        top = rect.top - menuHeight - 4
      }
    }

    // 检测是否超出上边界
    if (top < 10) {
      top = 10
    }

    setMenuPosition({ left, top })
  }, [anchorEl, anchorPoint])

  if (!anchorEl && !anchorPoint) return null

  // 使用 Portal 渲染到 document.body，避免 transform 影响 fixed 定位
  const menuContent = (
    <div
      ref={menuRef}
      className="gh-menu"
      {...OPHEL_HOVER_WIDTH_RETAIN_LAYER_PROPS}
      style={{
        position: "fixed",
        top: menuPosition ? `${menuPosition.top}px` : "-9999px",
        left: menuPosition ? `${menuPosition.left}px` : "-9999px",
        zIndex: 2147483647, // 最大 z-index 值
        pointerEvents: "auto",
      }}>
      {children}
    </div>
  )

  return createPortal(menuContent, document.body)
}

// ==================== 菜单按钮 ====================

interface MenuButtonProps {
  onClick: () => void
  danger?: boolean
  children: React.ReactNode
}

export const MenuButton: React.FC<MenuButtonProps> = ({ onClick, danger, children }) => (
  <button onClick={onClick} className={`gh-menu-btn${danger ? " danger" : ""}`}>
    {children}
  </button>
)

// ==================== 文件夹菜单 ====================

interface FolderMenuProps {
  folder: Folder
  anchorEl: HTMLElement | null
  onClose: () => void
  onRename: () => void
  onDelete: () => void
}

export const FolderMenu: React.FC<FolderMenuProps> = ({
  folder: _folder,
  anchorEl,
  onClose,
  onRename,
  onDelete,
}) => {
  return (
    <ContextMenu anchorEl={anchorEl} onClose={onClose}>
      <MenuButton
        onClick={() => {
          onClose()
          onRename()
        }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}>
          <span>{t("conversationsRename")}</span>
          <RenameIcon size={13} />
        </span>
      </MenuButton>
      <MenuButton
        danger
        onClick={() => {
          onClose()
          onDelete()
        }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}>
          <span>{t("conversationsDelete")}</span>
          <DeleteIcon size={13} />
        </span>
      </MenuButton>
    </ContextMenu>
  )
}

// ==================== 会话菜单 ====================

interface ConversationMenuProps {
  conversation: Conversation
  anchorEl: HTMLElement | null
  anchorPoint?: MenuAnchorPoint
  onClose: () => void
  onOpenInNewTab: () => void
  onRename: () => void
  onTogglePin: () => void
  onSetTags: () => void
  onMoveTo: () => void
  onExport: () => void
  onDelete: () => void
}

export const ConversationMenu: React.FC<ConversationMenuProps> = ({
  conversation,
  anchorEl,
  anchorPoint,
  onClose,
  onOpenInNewTab,
  onRename,
  onTogglePin,
  onSetTags,
  onMoveTo,
  onExport,
  onDelete,
}) => {
  return (
    <ContextMenu anchorEl={anchorEl} anchorPoint={anchorPoint} onClose={onClose}>
      <MenuButton
        onClick={() => {
          onClose()
          onOpenInNewTab()
        }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}>
          <span>{t("conversationsOpenInNewTab")}</span>
          <LinkIcon size={13} />
        </span>
      </MenuButton>
      <MenuButton
        onClick={() => {
          onClose()
          onRename()
        }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}>
          <span>{t("conversationsRename")}</span>
          <RenameIcon size={13} />
        </span>
      </MenuButton>
      <MenuButton
        onClick={() => {
          onClose()
          onTogglePin()
        }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}>
          <span>{conversation.pinned ? t("conversationsUnpin") : t("conversationsPin")}</span>
          <PinIcon size={13} filled={conversation.pinned} />
        </span>
      </MenuButton>
      <MenuButton
        onClick={() => {
          onClose()
          onSetTags()
        }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}>
          <span>{t("conversationsSetTags")}</span>
          <TagIcon size={13} />
        </span>
      </MenuButton>
      <MenuButton
        onClick={() => {
          onClose()
          onMoveTo()
        }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}>
          <span>{t("conversationsMoveTo")}</span>
          <FolderMoveIcon size={13} />
        </span>
      </MenuButton>
      <MenuButton
        onClick={() => {
          onClose()
          onExport()
        }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}>
          <span>{t("export")}</span>
          <ExportIcon size={13} />
        </span>
      </MenuButton>
      <MenuButton
        danger
        onClick={() => {
          onClose()
          onDelete()
        }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}>
          <span>{t("conversationsDelete")}</span>
          <DeleteIcon size={13} />
        </span>
      </MenuButton>
    </ContextMenu>
  )
}

// ==================== 导出菜单 ====================

interface ExportMenuProps {
  anchorEl: HTMLElement | null
  anchorPoint?: MenuAnchorPoint
  onClose: () => void
  onExportMarkdown: () => void
  onExportJSON: () => void
  onExportTXT: () => void
  onExportHTML: () => void
  onCopyMarkdown?: () => void
  onSegmentedExport?: () => void
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  anchorEl,
  anchorPoint,
  onClose,
  onExportMarkdown,
  onExportJSON,
  onExportTXT,
  onExportHTML,
  onCopyMarkdown,
  onSegmentedExport,
}) => {
  return (
    <ContextMenu anchorEl={anchorEl} anchorPoint={anchorPoint} onClose={onClose}>
      <MenuButton
        onClick={() => {
          onClose()
          onExportMarkdown()
        }}>
        <MarkdownIcon size={14} />
        <span>{t("exportToMarkdown")}</span>
      </MenuButton>
      <MenuButton
        onClick={() => {
          onClose()
          onExportJSON()
        }}>
        <JSONFileIcon size={14} />
        <span>{t("exportToJSON")}</span>
      </MenuButton>
      <MenuButton
        onClick={() => {
          onClose()
          onExportTXT()
        }}>
        <TXTFileIcon size={14} />
        <span>{t("exportToTXT")}</span>
      </MenuButton>
      <MenuButton
        onClick={() => {
          onClose()
          onExportHTML()
        }}>
        <HTMLFileIcon size={14} />
        <span>{t("exportToHTML")}</span>
      </MenuButton>
      {onCopyMarkdown && (
        <>
          <div className="gh-menu-divider" />
          <MenuButton
            onClick={() => {
              onClose()
              onCopyMarkdown()
            }}>
            <CopyIcon size={14} />
            <span>{t("exportToClipboard")}</span>
          </MenuButton>
        </>
      )}
      {onSegmentedExport && (
        <>
          <div className="gh-menu-divider" />
          <MenuButton
            onClick={() => {
              onClose()
              onSegmentedExport()
            }}>
            <SegmentedExportIcon size={14} />
            <span>{t("segmentedExportMenuItem")}</span>
          </MenuButton>
        </>
      )}
    </ContextMenu>
  )
}
