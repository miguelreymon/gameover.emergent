
import Image from 'next/image';
import { siteContent as defaultContent } from '@/lib/content';
import { getContent } from '@/lib/data';
import { getImage } from '@/lib/images';

export default async function AboutPage() {
  const config = await getContent();
  const siteContent = config || defaultContent;
  const { hero, story, mission } = siteContent.aboutPage;
  return (
    <div className="bg-background">
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-primary/10 pt-14">
        <div
          className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white shadow-xl shadow-primary/10 ring-1 ring-primary/5 sm:-mr-80 lg:-mr-96"
          aria-hidden="true"
        />
        <div className="container mx-auto px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 xl:grid-cols-1 xl:grid-rows-1 xl:gap-x-8">
            <h1 className="max-w-2xl text-4xl font-bold font-headline tracking-tight text-foreground sm:text-6xl lg:col-span-2 xl:col-auto">
              {hero.title}
            </h1>
            <div className="mt-6 max-w-xl lg:mt-0 xl:col-end-1 xl:row-start-1">
              <p className="text-lg leading-8 text-muted-foreground" dangerouslySetInnerHTML={{ __html: hero.description }} />
            </div>
            <Image
              src={getImage(hero.imageSrc)}
              alt="Jugador disfrutando con la Consola Gameover®"
              className="mt-10 aspect-[6/5] w-full max-w-lg rounded-2xl object-cover sm:mt-16 lg:mt-0 lg:max-w-none xl:row-span-2 xl:row-end-2 xl:mt-36"
              width={600}
              height={500}
              data-ai-hint="gamer playing"
              unoptimized
            />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white sm:h-32" />
      </div>

      <div className="container mx-auto px-6 py-16 sm:py-24 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold font-headline">{story.title}</h2>
            {story.paragraphs.map((p, i) => (
                <p key={i} className={`mt-4 ${i === story.paragraphs.length - 1 ? 'font-semibold' : ''} text-muted-foreground`}>{p}</p>
            ))}
          </div>
          <div className="aspect-square relative rounded-2xl overflow-hidden">
            <Image 
                src={getImage(story.imageSrc)}
                alt="Carla, fundadora de Game Over"
                fill
                className="object-cover"
                data-ai-hint="woman portrait"
                unoptimized
            />
          </div>
        </div>
        
        <div className="mt-24 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold font-headline">{mission.title}</h2>
          {mission.paragraphs.map((p, i) => (
            <p key={i} className="mt-4 text-lg text-muted-foreground">{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
