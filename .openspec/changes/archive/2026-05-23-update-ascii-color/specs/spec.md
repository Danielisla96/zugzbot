# Especificación: Cambio de Color de Arte ASCII

**Feature:** Estética Premium del Instalador

  Como desarrollador
  Quiero que el arte ASCII de bienvenida sea visualmente atractivo
  Para mejorar la experiencia de usuario desde el primer contacto con la herramienta

  Scenario: El arte ASCII se muestra con un degradado bitonal
    Given que ejecuto el script "install-plugin.sh"
    When el script llega a la sección de bienvenida
    Then el arte ASCII "ZUGZ" debe mostrarse con una transición de color
    And la parte superior debe ser Cian (\033[1;36m)
    And la parte inferior debe ser Magenta (\033[1;35m)
