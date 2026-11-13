import {shortThemes} from '../../V1.1/landing/shortThemeLibrary';
import {createThemeInstance} from '../../V1.1/landing/themeModel';
import {coverSources,getCategoryCover} from '../../V1.1/media/categoryImages';
export const examples=[
 ['makeup','Makeup','MUSE BEAUTY','short-skincare','Your moment. Your glow.','Soft glam, bridal looks and the confidence to show up as yourself.','Explore our looks','beauty-cosmetics/makeup-artistry'],
 ['tech','Tech','NOVA WORKSPACE','short-digital','Big ideas. Less busywork.','A calmer home for your plans, projects and next big idea.','Explore the workspace'],
 ['food','Food','THE JOLLOF ROOM','short-takeaway','Good food. Great company.','Smoky jollof, golden plantain and the kind of lunch you look forward to.','See the menu'],
 ['hair','Hair','CROWN & CO.','short-hair','Your next good hair day.','Natural texture, thoughtful styling and a little time just for you.','Book your appointment'],
 ['fashion','Fashion','OFF DUTY STUDIO','short-footwear','Made for your everyday.','Fresh silhouettes. Easy outfits. Find the pair you will keep reaching for.','Explore the collection'],
 ['consulting','Consulting','THE NEXT MOVE','short-consultant','A clearer way forward.','Let’s turn your business questions into practical next steps.','Request a discovery call'],
 ['events','Events','AFTER HOURS CLUB','short-event','Good music. Better memories.','A sunset session for the people who know how to enjoy a good evening.','Explore the event'],
 ['property','Real estate','PALM HOUSE','short-property','A place to call your own.','Light-filled spaces and thoughtful details. Let’s find your next home.','Arrange a viewing'],
 ['fitness','Fitness','MOVE WITH MAYA','short-fitness','Find your kind of strong.','Start where you are. Build a routine that fits the life you want.','Ask about a session'],
 ['photography','Photography','STILL STORIES','short-photography','Let your story be seen.','Portraits, campaigns and the little moments that deserve to stay.','Plan your next shoot']
].map(([id,category,brand,themeId,title,description,cta,photo])=>({id,category,brand,themeId,title,description,cta,photo}));
export function exampleInstance(example){
 const theme=shortThemes.find(t=>t.id===example.themeId);
 const instance=createThemeInstance(theme,{publicName:example.brand});
 instance.sections=instance.sections.map(s=>({...s,title:example.title,description:example.description,primary:example.cta,submitLabel:example.cta,formTitle:example.cta,primaryUrl:'https://mytiklink.com/v1-1/register',...(example.photo?{image:coverSources(getCategoryCover(example.photo))?.src,imageAlt:example.category}: {})}));
 return instance;
}
