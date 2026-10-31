import ThemeGallery from '../../../V1.1/landing/ThemeGallery';
const demoProfile={publicName:"Rhythm Music Studio",accountType:"business",category:{id:"education-training/music-schools",label:"Music Schools"},brand:{preferredColor:"#342366"},socialLinks:{}};
export default function MusicPickerDemo(){return <ThemeGallery demoProfile={demoProfile} demoLabel="SAMPLE MUSIC SCHOOL" initialSearch="Campaign Profile"/>;}
