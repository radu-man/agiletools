import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

export const Card = styled.div<{ $interactive?: boolean; $padding?: string }>`
  background-color: ${props => props.theme.surface};
  border-radius: 16px;
  border: 1px solid ${props => props.theme.border};
  padding: ${props => props.$padding || '1.5rem'};
  transition: all 0.2s ease;
  
  ${props => props.$interactive && css`
    cursor: pointer;
    &:hover {
      border-color: ${props.theme.primary};
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
  `}
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; $size?: 'sm' | 'md' | 'lg' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  outline: none;

  ${props => {
    switch(props.$size) {
      case 'sm': return css`padding: 0.4rem 0.75rem; font-size: 0.8rem;`;
      case 'lg': return css`padding: 1rem 2rem; font-size: 1.1rem;`;
      default: return css`padding: 0.75rem 1.5rem; font-size: 1rem;`;
    }
  }}

  ${props => {
    switch(props.$variant) {
      case 'secondary': return css`
        background-color: ${props.theme.background};
        color: ${props.theme.textPrimary};
        border: 1px solid ${props.theme.border};
        &:hover { background-color: ${props.theme.sidebarActive}; }
      `;
      case 'ghost': return css`
        background-color: transparent;
        color: ${props.theme.textSecondary};
        &:hover { background-color: ${props.theme.sidebarActive}; color: ${props.theme.textPrimary}; }
      `;
      case 'danger': return css`
        background-color: #fee2e2;
        color: #ef4444;
        &:hover { background-color: #fecaca; }
      `;
      default: return css`
        background-color: ${props.theme.primary};
        color: white;
        box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
        &:hover { transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4); }
        &:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
      `;
    }
  }}
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.border};
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.textPrimary};
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    background-color: ${props => props.theme.surface};
  }
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.75rem;
  color: ${props => props.theme.textSecondary};
  font-weight: 500;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

export const ModalContainer = styled(motion.div)`
  background-color: ${props => props.theme.surface};
  padding: 2.5rem;
  border-radius: 24px;
  width: 100%;
  max-width: 440px;
  margin: 0 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

export const Flex = styled.div<{ $gap?: string; $align?: string; $justify?: string; $direction?: string }>`
  display: flex;
  gap: ${props => props.$gap || '0'};
  align-items: ${props => props.$align || 'stretch'};
  justify-content: ${props => props.$justify || 'flex-start'};
  flex-direction: ${props => props.$direction || 'row'};
`;

export const Typography = styled.span<{ $variant?: 'h1' | 'h2' | 'h3' | 'body' | 'small'; $weight?: number; $color?: string }>`
  color: ${props => {
    if (!props.$color) return props.theme.textPrimary;
    return (props.theme as any)[props.$color] || props.$color;
  }};
  font-weight: ${props => props.$weight || 400};
  
  ${props => {
    switch(props.$variant) {
      case 'h1': return css`font-size: 2rem; font-weight: 800; letter-spacing: -0.025em;`;
      case 'h2': return css`font-size: 1.5rem; font-weight: 700;`;
      case 'h3': return css`font-size: 1.1rem; font-weight: 600;`;
      case 'small': return css`font-size: 0.85rem;`;
      default: return css`font-size: 1rem;`;
    }
  }}
`;
