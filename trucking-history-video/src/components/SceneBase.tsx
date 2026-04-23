import { AbsoluteFill } from "remotion";
import { BrandBar } from "./BrandBar";

type Props = {
  bg?: string;
  children: React.ReactNode;
  episode?: string;
};

export const SceneBase: React.FC<Props> = ({
  bg = "#080C14",
  children,
  episode = "EP. 1",
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      {children}
      <BrandBar episode={episode} />
    </AbsoluteFill>
  );
};
