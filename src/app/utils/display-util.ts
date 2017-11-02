export class  DisplayUtil{

    static  quilOpsToHtml(ops:any):string
    {
        let html = ops.map(function (op)
        {
            if (typeof op.insert !== 'string') return '';
            let html = op.insert.replace("\n", "<br /><br />");
            if (op.attributes !== null) {
                if (op.attributes.bold) {
                    html = '<strong>' + html + '</strong>';
                }
            }
            return html;
        }).join('');
        console.log(html);
        return html;
    }
}
