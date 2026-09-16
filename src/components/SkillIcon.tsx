import { Code2, Sparkles, Server, Database, Palette, Smartphone, Image, Boxes, Target, Shield, Handshake, Flame, Box, Layout, Globe, Cpu, Binary } from 'lucide-react';
const icons={Code2,Sparkles,Server,Database,Palette,Smartphone,Image,Boxes,Target,Shield,Handshake,Flame,Box,Layout,Globe,Cpu,Binary};
export function SkillIcon({name}:{name:string}) { const Icon=icons[name as keyof typeof icons]||Code2;return <Icon size={19}/>; }

