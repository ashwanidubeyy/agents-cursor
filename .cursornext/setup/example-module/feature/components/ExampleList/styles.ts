import styled from "styled-components";

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Item = styled.li`
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const Name = styled.span`
  font-weight: 600;
`;

const Email = styled.span`
  font-size: 0.8125rem;
  color: #6b7280;
`;

const Empty = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
`;

export const ExampleListStyles = {
  List,
  Item,
  Name,
  Email,
  Empty,
};
