import styled from 'styled-components';

const Main = styled.main`
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
`;

const Status = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Message = styled.pre`
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: #f3f4f6;
  font-size: 0.8125rem;
  overflow-x: auto;
`;

export const __MODULE__PageStyles = {
  Main,
  Title,
  Status,
  Actions,
  Message,
};
