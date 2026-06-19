import styled from 'styled-components';
import { COLORS } from '@/theme/colors';
import { TYPOGRAPHY } from '@/theme/typography';

const Container = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem 1.5rem;
  text-align: center;
  background-color: ${COLORS.BACKGROUND};
`;

const Title = styled.h1`
  margin: 0 0 0.75rem;
  color: ${COLORS.TEXT_PRIMARY};
  font-size: ${TYPOGRAPHY.HEADING_H2.fontSize};
  font-weight: ${TYPOGRAPHY.HEADING_H2.fontWeight};
  line-height: ${TYPOGRAPHY.HEADING_H2.lineHeight};
`;

const Message = styled.p`
  margin: 0 0 2rem;
  max-width: 28rem;
  color: ${COLORS.TEXT_SECONDARY};
  font-size: ${TYPOGRAPHY.BODY.fontSize};
  font-weight: ${TYPOGRAPHY.BODY.fontWeight};
  line-height: ${TYPOGRAPHY.BODY.lineHeight};
`;

export const ConnectionLostStyles = {
  Container,
  Title,
  Message,
};
