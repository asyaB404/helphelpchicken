
import { _decorator, sys } from 'cc';
const { ccclass, property } = _decorator;

export class FileMgr {

    public loadFile() {

        return new Promise<string>((resolve, reject) => {
            var input = document.createElement('input');

            document.body.appendChild(input);

            input.type = 'file';

            input.accept = ".json";//

            input.onchange = (e: any) => {

                let files = e.target.files;
                if (files.length == 0) {
                    resolve && resolve(null);
                    return;
                }
                const fileReader = new FileReader();

                fileReader.onload = (e) => {
                    const data = e.target.result as string;
                    resolve && resolve(data);

                }
                fileReader.readAsText(files[0], "UTF-8");

            }
            input.click();
        })



    }

    saveFile(textToWrite: string, fileNameToSaveAs: string) {
        if (sys.isBrowser) {
            let textFileAsBlob = new Blob([textToWrite], { type: 'application/json' });
            let downloadLink = document.createElement("a");
            downloadLink.download = fileNameToSaveAs;
            downloadLink.innerHTML = "Download File";
            if (window.webkitURL != null) {
                // Chrome allows the link to be clicked
                // without actually adding it to the DOM.
                downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
            }
            else {
                // Firefox requires the link to be added to the DOM
                // before it can be clicked.
                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                // downloadLink.onclick = destroyClickedElement;
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
            }
            downloadLink.click();
        }
    }

}

