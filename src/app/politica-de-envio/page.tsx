
export default function ShippingPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 lg:py-16 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Política de Envío</h1>
      <div className="space-y-6 text-muted-foreground">
        <h2 className="text-2xl font-bold text-foreground mt-4">
          Procesamiento del Pedido
        </h2>
        <p>
          Una vez que realizas tu pedido, nuestro equipo lo procesará en tan
          solo 1 día hábil. Recibirás una notificación por correo electrónico
          una vez que tu pedido haya sido enviado.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-4">
          Costes y Tiempos de Envío
        </h2>
        <p>
          Ofrecemos envío gratuito con MRW en todos los pedidos.
        </p>
        <p>
          El tiempo estimado de entrega para todos los pedidos es de 2 a 3
          días hábiles desde el momento en que se procesa tu pedido.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-4">
          Seguimiento de tu Pedido
        </h2>
        <p>
          Recibirás un número de seguimiento por correo electrónico
          inmediatamente después de que tu compra haya sido enviada. Con este
          número, podrás monitorear el estado de tu pedido en tiempo real a
          través del sitio web del transportista.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-4">
          Contacto
        </h2>
        <p>
          Si tienes alguna pregunta sobre tu envío, no dudes en ponerte en
          contacto con nuestro equipo de atención al cliente. ¡Estamos aquí
          para ayudarte! 😊
        </p>
      </div>
    </div>
  );
}
