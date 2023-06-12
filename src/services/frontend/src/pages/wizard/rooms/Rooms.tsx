import { useParams } from "react-router-dom";

export default function Rooms() {
  const { uid } = useParams();
  return <div>Rooms {uid}</div>;
}
