class ErrorDominio(Exception):
    """Base de las excepciones de dominio que lanzan los Services.

    El Router las captura y las traduce al código HTTP que corresponde.
    """

    def __init__(self, mensaje: str):
        super().__init__(mensaje)
        self.mensaje = mensaje
