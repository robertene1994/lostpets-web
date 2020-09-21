/**
 * Clase de utilidades que permite generar códigos alfanuméricos aleatorios.
 *
 * @author Robert Ene
 */
export class CodeGeneratorUtil {

    private static CODE_GENERATOR = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    private static CODE_LENGTH_DEFAULT = 10;
    private static CODE_LENGTH_MIN = 5;
    private static CODE_LENGTH_MAX = 30;

    /**
     * Método que genera de forma aleatoria un código alfanumérico basado en una longitud
     * determinada.
     * @param length la longitud del código generado, que tiene que ser un valor comprendido
     * entre los valores {@link CODE_LENGTH_MIN} mínimo y {@link CODE_LENGTH_MAX} máximo
     * definidos.
     * @return el código alfanumérico generado de forma aleatoria.
     */
    static random(length?: number): string {
        let codeLength = length;
        if (length === undefined || length < this.CODE_LENGTH_MIN || length > this.CODE_LENGTH_MAX) {
            codeLength = this.CODE_LENGTH_DEFAULT;
        }
        let code = '';
        for (let i = 0; i < codeLength; i++) {
            code += this.CODE_GENERATOR.charAt(Math.floor(Math.random() * this.CODE_GENERATOR.length));
        }
        return code;
    }
}
