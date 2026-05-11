import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ContactoPage() {
  return (
    <div className="container mx-auto px-4 py-8 lg:py-16 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Contacto</CardTitle>
          <CardDescription>
            ¿Tienes alguna pregunta? Rellena el formulario y nuestro equipo te
            responderá en menos de 24 horas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" placeholder="Tu nombre" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Asunto</Label>
              <Input id="subject" placeholder="Asunto de tu mensaje" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                placeholder="Escribe aquí tu consulta..."
                className="min-h-[150px]"
              />
            </div>
            <Button type="submit" className="w-full">
              Enviar Mensaje
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
