import type { ExampleItem } from "@/features/example/types/example.types";
import { ExampleListStyles } from "./styles";

interface ExampleListProps {
  items: ExampleItem[];
  loading?: boolean;
}

const ExampleList = ({ items, loading }: ExampleListProps) => {
  if (loading) {
    return <ExampleListStyles.Empty>Loading...</ExampleListStyles.Empty>;
  }

  if (!items?.length) {
    return <ExampleListStyles.Empty>No items yet.</ExampleListStyles.Empty>;
  }

  return (
    <ExampleListStyles.List>
      {items?.map((item) => (
        <ExampleListStyles.Item key={item?.id}>
          <ExampleListStyles.Name>{item?.name}</ExampleListStyles.Name>
          <ExampleListStyles.Email>{item?.email}</ExampleListStyles.Email>
        </ExampleListStyles.Item>
      ))}
    </ExampleListStyles.List>
  );
};

export default ExampleList;
